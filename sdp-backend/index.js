// index.js (backend)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const customerRoutes = require('./routes/customerRoutes');


const app = express();
const port = 5000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend origin

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers', customerRoutes);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
