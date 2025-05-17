const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const userController = {
  getAllUsers: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      console.log('Fetching all users...');
      
      const [users] = await connection.query(
        'SELECT UserID, Username, Role FROM users'
      );
      console.log('Users fetched:', users);
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch users',
        details: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  createUser: async (req, res) => {
    let connection;
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      connection = await pool.getConnection();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await connection.query(
        'INSERT INTO users (Username, Password, Role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          UserID: result.insertId,
          Username: username,
          Role: role
        }
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  updateUser: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;

      if (!username || !role) {
        return res.status(400).json({ 
          error: 'Username and role are required' 
        });
      }

      connection = await pool.getConnection();
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(
          'UPDATE users SET Username = ?, Password = ?, Role = ? WHERE UserID = ?',
          [username, hashedPassword, role, id]
        );
      } else {
        await connection.query(
          'UPDATE users SET Username = ?, Role = ? WHERE UserID = ?',
          [username, role, id]
        );
      }

      res.status(200).json({ 
        message: 'User updated successfully',
        user: { UserID: id, Username: username, Role: role }
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({ 
        error: 'Failed to update user',
        details: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  deleteUser: async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      
      connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM users WHERE UserID = ?', 
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      res.status(200).json({ 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ 
        error: 'Failed to delete user',
        details: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  }
};

module.exports = userController;