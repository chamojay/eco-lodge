const pool = require('../config/db');

async function viewUsers() {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.query(
            'SELECT UserID, Username, Role FROM users'
        );
        
        console.log('\nAvailable Test Users:');
        console.log('===================');
        users.forEach(user => {
            console.log(`Username: ${user.Username}`);
            console.log(`Role: ${user.Role}`);
            console.log('Password: password123');  // Default test password
            console.log('-------------------');
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        connection.release();
    }
}

viewUsers();