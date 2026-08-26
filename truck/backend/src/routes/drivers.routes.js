const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, driversController.dashboard);

module.exports = router;
