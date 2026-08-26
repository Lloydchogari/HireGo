require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const truckRoutes = require('./routes/trucks.routes');
const driverRoutes = require('./routes/drivers.routes');
const uploadRoutes = require('./routes/uploads.routes');
const { UPLOAD_DIR } = require('./middleware/upload');

// Make sure the uploads folder exists before anything tries to write to it.
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Serve uploaded truck photos as static files, e.g. /uploads/172839-abc.jpg
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'truck-hire-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Central error handler (catches anything thrown/passed to next(err))
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Truck Hire backend running on http://localhost:${PORT}`);
});