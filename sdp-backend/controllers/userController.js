const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Create new user
exports.addUser = (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user to the database
    const insertQuery = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name, email, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user' });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
};

//login user

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const checkQuery = 'SELECT * FROM user WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  });
}