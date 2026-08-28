const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

function signToken(driverId) {
  return jwt.sign({ driverId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

function publicDriver(driver) {
  const { password_hash, ...rest } = driver;
  return rest;
}

// POST /api/auth/register
async function register(req, res) {
  const { fullName, phone, whatsapp, email, password, city } = req.body;

  if (!fullName || !phone || !password) {
    return res.status(400).json({ error: 'Full name, phone and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await db.query('SELECT id FROM drivers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this phone number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO drivers (full_name, phone, whatsapp, email, password_hash, city)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [fullName, phone, whatsapp || phone, email || null, passwordHash, city || null]
    );

    const driver = result.rows[0];
    const token = signToken(driver.id);

    res.status(201).json({ token, driver: publicDriver(driver) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Something went wrong creating your account. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM drivers WHERE phone = $1', [phone]);
    const driver = result.rows[0];

    if (!driver) {
      return res.status(401).json({ error: 'Incorrect phone number or password.' });
    }

    const match = await bcrypt.compare(password, driver.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect phone number or password.' });
    }

    const token = signToken(driver.id);
    res.json({ token, driver: publicDriver(driver) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong logging you in. Please try again.' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const result = await db.query('SELECT * FROM drivers WHERE id = $1', [req.driverId]);
    const driver = result.rows[0];
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });
    res.json({ driver: publicDriver(driver) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

// POST /api/auth/verify-password (driver only)
// Used to re-confirm identity before sensitive actions - logging out or
// deleting a listing - without forcing a full re-login. Never confirms
// anything the caller isn't already authorized for; it just re-checks
// the password of the currently logged-in driver (from their token).
async function verifyPassword(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  try {
    const result = await db.query('SELECT password_hash FROM drivers WHERE id = $1', [req.driverId]);
    const driver = result.rows[0];
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });

    const match = await bcrypt.compare(password, driver.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('Verify password error:', err);
    res.status(500).json({ error: 'Could not verify your password. Please try again.' });
  }
}

module.exports = { register, login, me, verifyPassword };