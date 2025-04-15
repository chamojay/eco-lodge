const pool = require('../config/db');

const customerTableController = {
  // GET all customers
  getAllCustomers: async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // UPDATE a customer
  updateCustomer: async (req, res) => {
    const { id } = req.params;
    const {
      Title,
      FirstName,
      LastName,
      Email,
      Phone,
      Country,
      Nic_Passport
    } = req.body;

    try {
      const [result] = await pool.query(
        `UPDATE customers 
         SET Title = ?, FirstName = ?, LastName = ?, Email = ?, 
             Phone = ?, Country = ?, Nic_Passport = ?
         WHERE CustomerID = ?`,
        [Title, FirstName, LastName, Email, Phone, Country, Nic_Passport, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({ message: 'Customer updated successfully' });
    } catch (err) {
      console.error('Error updating customer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = customerTableController;
