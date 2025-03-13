// index.js (backend)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend origin

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});