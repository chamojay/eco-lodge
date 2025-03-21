const db = require('./config/db');

async function seed() {
  try {
    // Insert sample rooms
    await db.query(`
      INSERT INTO rooms (RoomNumber, Type, Price, Status, Description)
      VALUES
        ('111', 'Delux', 35000.00, 'Available', 'Luxurious Delux room'),
        ('211', 'Suite', 20000.00, 'Available', 'Executive Suite'),
        ('311', 'Standard', 8000.00, 'Available', 'Standard Room')
    `);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();