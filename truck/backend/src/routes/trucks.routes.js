const express = require('express');
const router = express.Router();
const trucksController = require('../controllers/trucks.controller');
const { requireAuth } = require('../middleware/auth');

// Public routes (customers - no login)
router.get('/', trucksController.list);
router.get('/mine', requireAuth, trucksController.mine); // must come before /:id
router.get('/:id', trucksController.getOne);
router.post('/:id/contact', trucksController.logContact);

// Driver-only routes
router.post('/', requireAuth, trucksController.create);
router.put('/:id', requireAuth, trucksController.update);
router.delete('/:id', requireAuth, trucksController.remove);

module.exports = router;
