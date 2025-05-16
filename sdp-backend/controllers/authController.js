const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Add environment variable check
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1); // Exit if JWT_SECRET is not configured
}

const authController = {
  register: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { username, password, role } = req.body;
      
      // Check if user exists
      const [existingUser] = await connection.query(
        'SELECT Username FROM users WHERE Username = ?',
        [username]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await connection.query(
        'INSERT INTO users (Username, Password, Role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      res.status(201).json({
        message: 'User created successfully',
        userId: result.insertId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    } finally {
      connection.release();
    }
  },

  login: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { username, password } = req.body;
      console.log('Login attempt for username:', username);
      console.log('JWT_SECRET availability:', !!process.env.JWT_SECRET);

      // Get user
      const [users] = await connection.query(
        'SELECT UserID, Username, Password, Role FROM users WHERE Username = ?',
        [username]
      );

      if (users.length === 0) {
        console.log('User not found:', username);
        return res.status(401).json({ error: 'User not found' });
      }

      const user = users[0];
      console.log('Found user:', { ...user, Password: '[HIDDEN]' });

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.Password);
      console.log('Password validation result:', isValidPassword);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Generate JWT with error handling
      try {
        const token = jwt.sign(
          { userId: user.UserID, role: user.Role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
          token,
          role: user.Role
        });
      } catch (jwtError) {
        console.error('JWT signing error:', jwtError);
        res.status(500).json({ error: 'Error generating authentication token' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    } finally {
      connection.release();
    }
  }
};

module.exports = authController;