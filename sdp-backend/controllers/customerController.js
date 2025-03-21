const db = require('../config/db');

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { Title, FirstName, LastName, Email, Phone, Country, Nic_Passport } = req.body;
    const [result] = await db.execute(
      `INSERT INTO customers (Title, FirstName, LastName, Email, Phone, Country, Nic_Passport) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Title, FirstName, LastName, Email, Phone, Country, Nic_Passport]
    );
    res.status(201).json({ message: 'Customer created successfully', CustomerID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await db.execute('SELECT * FROM customers');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
