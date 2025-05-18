const pool = require('../config/db');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { RoomNumber, TypeID, LocalPrice, ForeignPrice, MaxPeople, Description } = req.body;

    if (!RoomNumber || !TypeID || !LocalPrice || !ForeignPrice || !MaxPeople) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // First check if room type exists
    const [roomTypes] = await pool.query(
      'SELECT TypeID FROM room_types WHERE TypeID = ?',
      [TypeID]
    );

    if (roomTypes.length === 0) {
      return res.status(400).json({ message: 'Invalid room type' });
    }

    const [result] = await pool.query(
      'INSERT INTO rooms (RoomNumber, TypeID, LocalPrice, ForeignPrice, MaxPeople, Description) VALUES (?, ?, ?, ?, ?, ?)',
      [RoomNumber, TypeID, LocalPrice, ForeignPrice, MaxPeople, Description || '']
    );

    const [room] = await pool.query(
      `SELECT r.*, rt.Name as TypeName, rt.ImagePath as TypeImagePath
       FROM rooms r 
       JOIN room_types rt ON r.TypeID = rt.TypeID 
       WHERE r.RoomID = ?`,
      [result.insertId]
    );

    res.status(201).json(room[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = `
      SELECT r.*, rt.Name as TypeName, rt.ImagePath as TypeImagePath, rt.Description as TypeDescription
      FROM rooms r 
      JOIN room_types rt ON r.TypeID = rt.TypeID 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (r.RoomNumber LIKE ? OR r.Description LIKE ?)';

      params.push(`%${search}%`, `%${search}%`);
    }
    if (type && type !== 'All') {
      query += ' AND r.TypeID = ?';
      params.push(type);
    }

    const [rooms] = await pool.query(query, params);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  try {
    const [rooms] = await pool.query(
      `SELECT r.*, rt.Name as TypeName, rt.ImagePath as TypeImagePath, rt.Description as TypeDescription
       FROM rooms r 
       JOIN room_types rt ON r.TypeID = rt.TypeID 
       WHERE r.RoomID = ?`,
      [req.params.id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(rooms[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a room
const updateRoom = async (req, res) => {
  try {
    const { RoomNumber, TypeID, LocalPrice, ForeignPrice, MaxPeople, Description } = req.body;

    if (!RoomNumber || !TypeID || !LocalPrice || !ForeignPrice || !MaxPeople) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if room type exists
    const [roomTypes] = await pool.query(
      'SELECT TypeID FROM room_types WHERE TypeID = ?',
      [TypeID]
    );

    if (roomTypes.length === 0) {
      return res.status(400).json({ message: 'Invalid room type' });
    }

    const [result] = await pool.query(
      'UPDATE rooms SET RoomNumber = ?, TypeID = ?, LocalPrice = ?, ForeignPrice = ?, MaxPeople = ?, Description = ? WHERE RoomID = ?',
      [RoomNumber, TypeID, LocalPrice, ForeignPrice, MaxPeople, Description || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const [updatedRoom] = await pool.query(
      `SELECT r.*, rt.Name as TypeName, rt.ImagePath as TypeImagePath, rt.Description as TypeDescription
       FROM rooms r 
       JOIN room_types rt ON r.TypeID = rt.TypeID 
       WHERE r.RoomID = ?`,
      [req.params.id]
    );

    res.status(200).json(updatedRoom[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    // Check if room has any reservations
    const [reservations] = await pool.query(
      'SELECT COUNT(*) as count FROM reservations WHERE RoomID = ?',
      [req.params.id]
    );

    if (reservations[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete room as it has existing reservations' 
      });
    }

    const [result] = await pool.query(
      'DELETE FROM rooms WHERE RoomID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};
