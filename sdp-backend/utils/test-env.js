require('dotenv').config();
console.log('Environment variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);