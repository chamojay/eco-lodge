const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend origin

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);

// Error handling middleware (should be placed after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
