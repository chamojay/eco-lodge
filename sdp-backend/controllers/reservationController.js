const db = require('../config/db');

// Function to get RoomID from RoomNumber
async function getRoomIdByRoomNumber(roomNumber) {
  const [rows] = await db.execute('SELECT RoomID FROM Rooms WHERE RoomNumber = ?', [roomNumber]);
  if (rows.length > 0) {
    return rows[0].RoomID;
  }
  return null; // Return null if no room found
}

// Check room availability
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { RoomID, CheckInDate, CheckOutDate, RoomNumber } = req.body;

    // If RoomNumber is provided instead of RoomID, fetch RoomID
    const actualRoomID = RoomID || await getRoomIdByRoomNumber(RoomNumber);
    
    if (!actualRoomID) {
      return res.status(400).json({ error: 'Room not found with the provided RoomNumber.' });
    }

    const [rows] = await db.execute(
      `SELECT * FROM room_status_history 
      WHERE RoomID = ? AND Status = 'Booked' 
      AND ((StartDate <= ? AND EndDate IS NULL) OR (StartDate BETWEEN ? AND ?))`,
      [actualRoomID, CheckInDate, CheckInDate, CheckOutDate]
    );

    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create reservation (check-in)
exports.createReservation = async (req, res) => {
    try {
      const { CustomerID, RoomID, RoomNumber, CheckInDate, CheckOutDate, PackageType, Adults, Children, SpecialRequests, ArrivalTime } = req.body;
  
      // If RoomNumber is provided instead of RoomID, fetch RoomID
      const actualRoomID = RoomID || await getRoomIdByRoomNumber(RoomNumber);
  
      if (!actualRoomID) {
        return res.status(400).json({ error: 'Room not found with the provided RoomNumber.' });
      }
  
      // Combine CheckInDate and ArrivalTime to form the StartDate
      const startDate = `${CheckInDate} ${ArrivalTime}`;
  
      const [result] = await db.execute(
        `INSERT INTO reservations (CustomerID, RoomID, CheckInDate, CheckOutDate, PackageType, Adults, Children, SpecialRequests, ArrivalTime, Status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`,
        [CustomerID, actualRoomID, CheckInDate, CheckOutDate, PackageType, Adults, Children, SpecialRequests, ArrivalTime]
      );
  
      // Mark room as booked using CheckInDate and ArrivalTime
      await db.execute(
        `INSERT INTO room_status_history (RoomID, Status, StartDate) 
        VALUES (?, 'Booked', ?)`,
        [actualRoomID, startDate]  // Use the combined date-time for StartDate
      );
  
      res.status(201).json({ message: 'Reservation confirmed', ReservationID: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Complete reservation (checkout)
exports.completeReservation = async (req, res) => {
  try {
    const { ReservationID, RoomID } = req.body;

    // Update reservation status
    await db.execute(
      `UPDATE reservations SET Status = 'Completed' WHERE ReservationID = ?`,
      [ReservationID]
    );

    // Mark room as available
    await db.execute(
      `UPDATE room_status_history 
      SET EndDate = NOW() 
      WHERE RoomID = ? AND Status = 'Booked' AND EndDate IS NULL`,
      [RoomID]
    );
    await db.execute(
      `INSERT INTO room_status_history (RoomID, Status, StartDate) 
      VALUES (?, 'Available', NOW())`,
      [RoomID]
    );

    res.json({ message: 'Checkout successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
