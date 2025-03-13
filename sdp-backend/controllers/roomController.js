// controllers/roomController.js
const mysql = require('mysql2/promise');

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root', 
  database: 'ecolodge' 
};

// Create a new room
const createRoom = async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { RoomNumber, Type, Price, Description } = req.body;

    if (!RoomNumber || !Type || !Price) {
      return res.status(400).json({ message: 'Room number, type, and price are required' });
    }

    // Check if room number exists
    const [existing] = await connection.execute(
      'SELECT * FROM rooms WHERE RoomNumber = ?',
      [RoomNumber]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    // Validate description length
    const wordCount = Description ? Description.trim().split(/\s+/).length : 0;
    if (wordCount > 100) {
      return res.status(400).json({ message: 'Description cannot exceed 100 words' });
    }

    const [result] = await connection.execute(
      'INSERT INTO rooms (RoomNumber, Type, Price, Description) VALUES (?, ?, ?, ?)',
      [RoomNumber, Type, Price, Description || '']
    );

    const newRoom = { RoomID: result.insertId, RoomNumber, Type, Price, Description };
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await connection.end();
  }
};

// Get all rooms
const getAllRooms = async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { search, type } = req.query;
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (RoomNumber LIKE ? OR Description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type && type !== 'All') {
      query += ' AND Type = ?';
      params.push(type);
    }

    const [rooms] = await connection.execute(query, params);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await connection.end();
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rooms] = await connection.execute(
      'SELECT * FROM rooms WHERE RoomID = ?',
      [req.params.id]
    );
    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(rooms[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await connection.end();
  }
};

// Update a room
const updateRoom = async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { RoomNumber, Type, Price, Description } = req.body;

    if (Description) {
      const wordCount = Description.trim().split(/\s+/).length;
      if (wordCount > 100) {
        return res.status(400).json({ message: 'Description cannot exceed 100 words' });
      }
    }

    const [result] = await connection.execute(
      'UPDATE rooms SET RoomNumber = ?, Type = ?, Price = ?, Description = ? WHERE RoomID = ?',
      [RoomNumber, Type, Price, Description || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const updatedRoom = { RoomID: req.params.id, RoomNumber, Type, Price, Description };
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await connection.end();
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [result] = await connection.execute(
      'DELETE FROM rooms WHERE RoomID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await connection.end();
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};