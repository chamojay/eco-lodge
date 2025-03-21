// db.js - Reusable DB Connection Pool
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ecolodge',
  waitForConnections: true,  // Wait for a connection if all are in use
  connectionLimit: 10,      // Max number of connections in the pool
  queueLimit: 0             // Unlimited queueing of requests
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log('Database connection pool created successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error creating database connection pool:', err);
  });

module.exports = pool;