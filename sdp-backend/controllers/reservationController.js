const pool = require('../config/db');

const ReservationController = {
  // Check room availability
  checkAvailability: async (req, res) => {
    try {
      const { checkIn, checkOut } = req.body;
      
      const [rooms] = await pool.query(
        `SELECT r.RoomNumber, r.Type, r.LocalPrice, r.ForeignPrice, r.MaxPeople 
         FROM rooms r
         WHERE r.RoomID NOT IN (
           SELECT RoomID 
           FROM reservations 
           WHERE Room_Status = 'Confirmed' 
           AND (
             (CheckInDate <= ? AND CheckOutDate >= ?) OR
             (CheckInDate <= ? AND CheckOutDate IS NULL)
           )
         )`,
        [checkOut, checkIn, checkIn]
      );

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new reservation
  createReservation: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { roomNumber, customerData, reservationData } = req.body;

      // Insert customer details
      const [customerResult] = await connection.query(
        `INSERT INTO customers (FirstName, LastName, Email, Phone, Country, NIC, PassportNumber) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          customerData.FirstName,
          customerData.LastName,
          customerData.Email,
          customerData.Phone,
          customerData.Country,
          customerData.NIC,
          customerData.PassportNumber
        ]
      );

      // Get Room ID from Room Number
      const [room] = await connection.query(
        'SELECT RoomID FROM rooms WHERE RoomNumber = ?',
        [roomNumber]
      );

      if (room.length === 0) {
        throw new Error('Room not found');
      }

      // Insert reservation
      const [reservationResult] = await connection.query(
        `INSERT INTO reservations (CustomerID, RoomID, CheckInDate, CheckOutDate, TotalAmount, PackageType, Adults, Children, SpecialRequests, ArrivalTime, DepartureTime, Room_Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerResult.insertId,
          room[0].RoomID,
          reservationData.CheckInDate,
          reservationData.CheckOutDate,
          reservationData.TotalAmount,
          reservationData.PackageType,
          reservationData.Adults,
          reservationData.Children,
          reservationData.SpecialRequests,
          reservationData.ArrivalTime,
          reservationData.DepartureTime,
          'Confirmed'
        ]
      );

      await connection.commit();
      
      res.status(201).json({
        id: reservationResult.insertId,
        total: reservationData.TotalAmount
      });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },

  // Fetch active reservations
  getActiveReservations: async (req, res) => {
    try {
      const [reservations] = await pool.query(
        `SELECT r.ReservationID, r.CheckOutDate, 
                c.FirstName, c.LastName,
                rm.RoomNumber,
                r.TotalAmount
         FROM reservations r
         JOIN customers c ON r.CustomerID = c.CustomerID
         JOIN rooms rm ON r.RoomID = rm.RoomID
         WHERE r.Room_Status = 'Confirmed'`
      );
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Complete checkout process
  completeCheckout: async (req, res) => {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update reservation status to 'Completed'
      await connection.query(
        'UPDATE reservations SET Room_Status = "Completed" WHERE ReservationID = ?',
        [id]
      );

      await connection.commit();
      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      console.error('Error completing checkout:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    } finally {
      connection.release();
    }
  },

  // Get all rooms status
  getAllRoomsStatus: async (req, res) => {
    try {
      const [rooms] = await pool.query(
        `SELECT 
            r.RoomNumber, 
            r.Type, 
            r.LocalPrice, 
            r.ForeignPrice, 
            r.MaxPeople,
            COALESCE(res.Room_Status, 'Completed') AS Room_Status
         FROM rooms r
         LEFT JOIN reservations res 
         ON r.RoomID = res.RoomID 
         AND res.Room_Status = 'Confirmed' 
         AND CURRENT_DATE BETWEEN res.CheckInDate AND res.CheckOutDate
         GROUP BY r.RoomID`
      );

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update reservation (limited fields only)
  updateReservation: async (req, res) => {
    const { id } = req.params;
    const {
      CheckInDate,
      CheckOutDate,
      PackageType,
      Adults,
      Children,
      SpecialRequests,
      ArrivalTime,
      DepartureTime
    } = req.body;

    try {
      const [result] = await pool.query(
        `UPDATE reservations 
         SET CheckInDate = ?, 
             CheckOutDate = ?, 
             PackageType = ?, 
             Adults = ?, 
             Children = ?, 
             SpecialRequests = ?, 
             ArrivalTime = ?, 
             DepartureTime = ?
         WHERE ReservationID = ?`,
        [
          CheckInDate,
          CheckOutDate,
          PackageType,
          Adults,
          Children,
          SpecialRequests,
          ArrivalTime,
          DepartureTime,
          id
        ]
      );

      res.json({ success: true, message: 'Reservation updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get reservation details
  getReservationDetails: async (req, res) => {
    const { id } = req.params;
    try {
      const [reservation] = await pool.query(
        `SELECT r.*, c.* 
         FROM reservations r 
         JOIN customers c ON r.CustomerID = c.CustomerID 
         WHERE r.ReservationID = ?`,
        [id]
      );

      if (reservation.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(reservation[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ReservationController;