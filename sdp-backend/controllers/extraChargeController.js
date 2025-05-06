const pool = require('../config/db');

const ExtraChargeController = {
  getChargesByReservation: async (req, res) => {
    const { reservationId } = req.params;
    try {
      const [charges] = await pool.query(
        `SELECT ec.*, ect.Name AS TypeName 
         FROM extra_charges ec
         LEFT JOIN extra_charge_types ect ON ec.TypeID = ect.TypeID
         WHERE ec.ReservationID = ?`,
        [reservationId]
      );
      res.json(charges);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addCharge: async (req, res) => {
    const { ReservationID, TypeID, Description, Amount } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO extra_charges (ReservationID, TypeID, Description, Amount) 
         VALUES (?, ?, ?, ?)`,
        [ReservationID, TypeID || null, Description, Amount]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCharge: async (req, res) => {
    const { id } = req.params;
    const { TypeID, Description, Amount } = req.body;
    try {
      await pool.query(
        `UPDATE extra_charges 
         SET TypeID = ?, Description = ?, Amount = ?
         WHERE ChargeID = ?`,
        [TypeID || null, Description, Amount, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCharge: async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM extra_charges WHERE ChargeID = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ExtraChargeController;
