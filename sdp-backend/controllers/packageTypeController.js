const pool = require('../config/db');

const packageTypeController = {
  getAllTypes: async (req, res) => {
    try {
      const [types] = await pool.query('SELECT * FROM package_types');
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createType: async (req, res) => {
    try {
      const { Name, Description, PriceMultiplier } = req.body;
      const ImagePath = req.file ? `/uploads/package-types/${req.file.filename}` : null;

      const [result] = await pool.query(
        'INSERT INTO package_types (Name, Description, PriceMultiplier, ImagePath) VALUES (?, ?, ?, ?)',
        [Name, Description, PriceMultiplier, ImagePath]
      );
      
      res.status(201).json({ 
        PackageID: result.insertId,
        Name,
        Description,
        PriceMultiplier,
        ImagePath
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateType: async (req, res) => {
    try {
      const { id } = req.params;
      const { Name, Description, PriceMultiplier } = req.body;
      const ImagePath = req.file ? `/uploads/package-types/${req.file.filename}` : undefined;

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
      if (PriceMultiplier) {
        updateFields.push('PriceMultiplier = ?');
        values.push(PriceMultiplier);
      }
      if (ImagePath) {
        updateFields.push('ImagePath = ?');
        values.push(ImagePath);
      }

      values.push(id);

      const [result] = await pool.query(
        `UPDATE package_types SET ${updateFields.join(', ')} WHERE PackageID = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Package type not found' });
      }

      res.json({ message: 'Package type updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteType: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM package_types WHERE PackageID = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Package type not found' });
      }

      res.json({ message: 'Package type deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = packageTypeController;