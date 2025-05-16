const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createTestUser() {
  const connection = await pool.getConnection();
  try {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword);

    const [result] = await connection.query(
      'INSERT INTO users (Username, Password, Role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Password = ?',
      ['admin', hashedPassword, 'ADMIN', hashedPassword]
    );

    console.log('User created/updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
  }
}

createTestUser();