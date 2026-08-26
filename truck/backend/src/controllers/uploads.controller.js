// POST /api/uploads/photo (driver only)
// Accepts a single image file (multipart/form-data, field name "photo")
// and returns the URL where it can be reached, so the frontend can save
// that URL onto a truck listing's photo_url field.
function uploadPhoto(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file was received.' });
  }

  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}

module.exports = { uploadPhoto };