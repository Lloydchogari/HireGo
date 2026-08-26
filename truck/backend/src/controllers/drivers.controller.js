const db = require('../db');

// GET /api/drivers/dashboard (driver only)
// Simple stats so a driver can see whether the app is working for them:
// total listings, total views, total contacts, and subscription status.
async function dashboard(req, res) {
  try {
    const truckStats = await db.query(
      `SELECT
         COUNT(*) AS total_listings,
         COALESCE(SUM(view_count), 0) AS total_views
       FROM trucks WHERE driver_id = $1`,
      [req.driverId]
    );

    const contactStats = await db.query(
      `SELECT COUNT(*) AS total_contacts
       FROM contact_events c
       JOIN trucks t ON t.id = c.truck_id
       WHERE t.driver_id = $1`,
      [req.driverId]
    );

    const driverResult = await db.query(
      'SELECT subscription_status, subscription_expires_at FROM drivers WHERE id = $1',
      [req.driverId]
    );

    res.json({
      totalListings: Number(truckStats.rows[0].total_listings),
      totalViews: Number(truckStats.rows[0].total_views),
      totalContacts: Number(contactStats.rows[0].total_contacts),
      subscriptionStatus: driverResult.rows[0]?.subscription_status,
      subscriptionExpiresAt: driverResult.rows[0]?.subscription_expires_at,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Could not load your dashboard.' });
  }
}

module.exports = { dashboard };
