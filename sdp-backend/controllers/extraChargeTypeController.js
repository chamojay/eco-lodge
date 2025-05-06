const pool = require('../config/db');

const ExtraChargeTypeController = {
  getAllTypes: async (req, res) => {
    try {
      const [types] = await pool.query('SELECT * FROM extra_charge_types');
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createType: async (req, res) => {
    const { Name, DefaultAmount } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO extra_charge_types (Name, DefaultAmount) VALUES (?, ?)',
        [Name, DefaultAmount]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateType: async (req, res) => {
    const { id } = req.params;
    const { Name, DefaultAmount } = req.body;
    try {
      await pool.query(
        'UPDATE extra_charge_types SET Name = ?, DefaultAmount = ? WHERE TypeID = ?',
        [Name, DefaultAmount, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteType: async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM extra_charge_types WHERE TypeID = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ExtraChargeTypeController;
