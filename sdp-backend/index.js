const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');  // Import the user routes

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
