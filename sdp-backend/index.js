require('dotenv').config();
const express = require('express');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reservationTableRoutes = require('./routes/reservationtableRoutes');
const customerTableRoutes = require('./routes/customertableRoutes');
const extraChargeRoutes = require('./routes/extraChargesRoutes');
const activityRoutes = require('./routes/activityRoutes');
const menuRoutes = require('./routes/Restaurant/menuRoutes');
const orderRoutes = require('./routes/Restaurant/orderRoutes');
const paymentRoutes = require('./routes/Restaurant/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const packageTypeRoutes = require('./routes/packageTypeRoutes');
const emailRoutes = require('./routes/emailRoutes');
const overviewRoutes = require('./routes/overviewRoutes');

const path = require('path');
const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] })); // Allow requests from React app
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve static files from the public directory

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reservationinfo', reservationTableRoutes);
app.use('/api/customerinfo', customerTableRoutes);
app.use('/api/extraCharges', extraChargeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/package-types', packageTypeRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/overview', overviewRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
