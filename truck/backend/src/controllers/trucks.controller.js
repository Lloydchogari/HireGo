const db = require('../db');

const TRUCK_TYPES = ['pickup', '1_ton', '3_ton', '5_ton', '7_ton', '10_ton', 'tipper', 'flatbed', 'other'];

// GET /api/trucks
// Public search/browse for customers. No login needed.
// Query params: q (free text), type, location, minCapacity, maxCapacity
async function list(req, res) {
  const { q, type, location, minCapacity, maxCapacity } = req.query;

  const conditions = ["t.status = 'active'"];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
  }
  if (type) {
    params.push(type);
    conditions.push(`t.truck_type = $${params.length}`);
  }
  if (location) {
    params.push(`%${location}%`);
    conditions.push(`t.location ILIKE $${params.length}`);
  }
  if (minCapacity) {
    params.push(minCapacity);
    conditions.push(`t.capacity_tonnes >= $${params.length}`);
  }
  if (maxCapacity) {
    params.push(maxCapacity);
    conditions.push(`t.capacity_tonnes <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Boosted (paid) listings that haven't expired show first, then newest first.
  const sql = `
    SELECT t.*, d.full_name AS driver_name, d.phone AS driver_phone,
           d.whatsapp AS driver_whatsapp, d.is_phone_verified,
           (t.is_boosted AND (t.boosted_until IS NULL OR t.boosted_until > now())) AS boosted_active
    FROM trucks t
    JOIN drivers d ON d.id = t.driver_id
    ${where}
    ORDER BY boosted_active DESC, t.created_at DESC
  `;

  try {
    const result = await db.query(sql, params);
    res.json({ trucks: result.rows });
  } catch (err) {
    console.error('List trucks error:', err);
    res.status(500).json({ error: 'Could not load trucks right now. Please try again.' });
  }
}

// GET /api/trucks/:id
async function getOne(req, res) {
  try {
    const result = await db.query(
      `SELECT t.*, d.full_name AS driver_name, d.phone AS driver_phone,
              d.whatsapp AS driver_whatsapp, d.is_phone_verified
       FROM trucks t
       JOIN drivers d ON d.id = t.driver_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    const truck = result.rows[0];
    if (!truck) return res.status(404).json({ error: 'Listing not found.' });

    // Count this as a view.
    await db.query('UPDATE trucks SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);

    res.json({ truck });
  } catch (err) {
    console.error('Get truck error:', err);
    res.status(500).json({ error: 'Could not load this listing.' });
  }
}

// GET /api/trucks/mine (driver's own listings, with basic stats)
async function mine(req, res) {
  try {
    const result = await db.query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM contact_events c WHERE c.truck_id = t.id) AS contact_count
       FROM trucks t
       WHERE t.driver_id = $1
       ORDER BY t.created_at DESC`,
      [req.driverId]
    );
    res.json({ trucks: result.rows });
  } catch (err) {
    console.error('Mine error:', err);
    res.status(500).json({ error: 'Could not load your listings.' });
  }
}

// POST /api/trucks (driver only)
async function create(req, res) {
  const { title, truckType, capacityTonnes, description, location, priceGuide, photoUrl } = req.body;

  if (!title || !truckType || !location) {
    return res.status(400).json({ error: 'Title, truck type and location are required.' });
  }
  if (!TRUCK_TYPES.includes(truckType)) {
    return res.status(400).json({ error: 'Invalid truck type.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO trucks (driver_id, title, truck_type, capacity_tonnes, description, location, price_guide, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.driverId, title, truckType, capacityTonnes || null, description || null, location, priceGuide || null, photoUrl || null]
    );
    res.status(201).json({ truck: result.rows[0] });
  } catch (err) {
    console.error('Create truck error:', err);
    res.status(500).json({ error: 'Could not create your listing. Please try again.' });
  }
}

// PUT /api/trucks/:id (driver only, must own the listing)
async function update(req, res) {
  const { title, truckType, capacityTonnes, description, location, priceGuide, photoUrl, status } = req.body;

  try {
    const owned = await db.query('SELECT id FROM trucks WHERE id = $1 AND driver_id = $2', [req.params.id, req.driverId]);
    if (owned.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    if (truckType && !TRUCK_TYPES.includes(truckType)) {
      return res.status(400).json({ error: 'Invalid truck type.' });
    }

    const result = await db.query(
      `UPDATE trucks SET
         title = COALESCE($1, title),
         truck_type = COALESCE($2, truck_type),
         capacity_tonnes = COALESCE($3, capacity_tonnes),
         description = COALESCE($4, description),
         location = COALESCE($5, location),
         price_guide = COALESCE($6, price_guide),
         photo_url = COALESCE($7, photo_url),
         status = COALESCE($8, status),
         updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [title, truckType, capacityTonnes, description, location, priceGuide, photoUrl, status, req.params.id]
    );
    res.json({ truck: result.rows[0] });
  } catch (err) {
    console.error('Update truck error:', err);
    res.status(500).json({ error: 'Could not update your listing.' });
  }
}

// DELETE /api/trucks/:id (driver only, must own the listing)
async function remove(req, res) {
  try {
    const result = await db.query('DELETE FROM trucks WHERE id = $1 AND driver_id = $2 RETURNING id', [req.params.id, req.driverId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete truck error:', err);
    res.status(500).json({ error: 'Could not delete your listing.' });
  }
}

// POST /api/trucks/:id/contact
// Logs that a customer tapped "Call" or "WhatsApp". No auth needed.
// This is how drivers can later see "your listing got X contacts this month".
async function logContact(req, res) {
  const { type } = req.body; // 'call' | 'whatsapp'
  if (!['call', 'whatsapp'].includes(type)) {
    return res.status(400).json({ error: 'Invalid contact type.' });
  }
  try {
    await db.query('INSERT INTO contact_events (truck_id, contact_type) VALUES ($1, $2)', [req.params.id, type]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Log contact error:', err);
    // Non-critical - don't block the user's call/whatsapp action on this failing.
    res.status(200).json({ success: false });
  }
}

module.exports = { list, getOne, mine, create, update, remove, logContact, TRUCK_TYPES };
