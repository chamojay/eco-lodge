// index.js
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');  
const roomRoutes = require('./routes/roomRoutes');  

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes); 

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});