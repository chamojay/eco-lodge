const pool = require('../config/db');

const roomTypeController = {
  getAllTypes: async (req, res) => {
    try {
      const [types] = await pool.query('SELECT * FROM room_types');
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createType: async (req, res) => {
    try {
      const { Name, Description } = req.body;
      const ImagePath = req.file ? `/uploads/room-types/${req.file.filename}` : null;

      const [result] = await pool.query(
        'INSERT INTO room_types (Name, Description, ImagePath) VALUES (?, ?, ?)',
        [Name, Description, ImagePath]
      );
      
      res.status(201).json({ 
        TypeID: result.insertId,
        Name,
        Description,
        ImagePath
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateType: async (req, res) => {
    try {
      const { id } = req.params;
      const { Name, Description } = req.body;
      const ImagePath = req.file ? `/uploads/room-types/${req.file.filename}` : undefined;

      const updateFields = [];
      const values = [];

      if (Name) {
        updateFields.push('Name = ?');
        values.push(Name);
      }
      if (Description) {
        updateFields.push('Description = ?');
        values.push(Description);
      }
      if (ImagePath) {
        updateFields.push('ImagePath = ?');
        values.push(ImagePath);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      values.push(id);

      const [result] = await pool.query(
        `UPDATE room_types SET ${updateFields.join(', ')} WHERE TypeID = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Room type not found' });
      }

      res.json({ message: 'Room type updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteType: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the room type is being used
      const [rooms] = await pool.query('SELECT COUNT(*) as count FROM rooms WHERE TypeID = ?', [id]);
      
      if (rooms[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete room type as it is being used by existing rooms' 
        });
      }

      const [result] = await pool.query('DELETE FROM room_types WHERE TypeID = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Room type not found' });
      }

      res.json({ message: 'Room type deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const [types] = await pool.query('SELECT * FROM room_types WHERE TypeID = ?', [id]);

      if (types.length === 0) {
        return res.status(404).json({ message: 'Room type not found' });
      }

      res.json(types[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = roomTypeController;