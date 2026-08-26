const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const uploadsController = require('../controllers/uploads.controller');

// Wrap multer so a bad/oversized file returns a clean JSON error instead of
// crashing the request.
function handlePhotoUpload(req, res, next) {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Could not upload that image.' });
    }
    next();
  });
}

router.post('/photo', requireAuth, handlePhotoUpload, uploadsController.uploadPhoto);

module.exports = router;