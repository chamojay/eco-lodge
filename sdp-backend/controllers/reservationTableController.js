// controllers/reservationTableController.js
const pool = require('../config/db');

const reservationTableController = {
  // GET all reservations with customer details and status
  getAllReservations: async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          r.ReservationID,
          DATE_FORMAT(r.CheckInDate, '%Y-%m-%d') AS CheckInDate,
          DATE_FORMAT(r.CheckOutDate, '%Y-%m-%d') AS CheckOutDate,
          r.Room_Status,
          r.PackageType,
          r.Adults,
          r.Children,
          r.SpecialRequests,
          r.ArrivalTime,
          r.DepartureTime,
          rm.RoomNumber,
          c.CustomerID,
          c.Title,
          c.FirstName,
          c.LastName,
          c.Email,
          c.Phone,
          c.Country,
          c.Nic_Passport,
          CASE 
        WHEN CURDATE() BETWEEN r.CheckInDate AND r.CheckOutDate THEN 'Active'
        WHEN CURDATE() < r.CheckInDate THEN 'Future'
        ELSE 'Past'
          END AS Status
        FROM reservations r
        JOIN customers c ON r.CustomerID = c.CustomerID
        JOIN rooms rm ON r.RoomID = rm.RoomID
        ORDER BY r.CheckInDate DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // UPDATE reservation and customer details
  updateReservation: async (req, res) => {
    const { id } = req.params;
    const {
      CheckInDate,
      CheckOutDate,
      Room_Status,
      PackageType,
      Adults,
      Children,
      SpecialRequests,
      ArrivalTime,
      DepartureTime,
      RoomNumber,
      Title,
      FirstName,
      LastName,
      Email,
      Phone,
      Country,
      Nic_Passport
    } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Get RoomID from RoomNumber
      const [room] = await connection.query(
        'SELECT RoomID FROM rooms WHERE RoomNumber = ?',
        [RoomNumber]
      );
      if (room.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }
      const RoomID = room[0].RoomID;

      // 2. Update reservation
      const [reservationResult] = await connection.query(
        `UPDATE reservations 
         SET CheckInDate = ?, CheckOutDate = ?, Room_Status = ?, 
             PackageType = ?, Adults = ?, Children = ?, SpecialRequests = ?, 
             ArrivalTime = ?, DepartureTime = ?, RoomID = ?
         WHERE ReservationID = ?`,
        [
          CheckInDate,
          CheckOutDate,
          Room_Status,
          PackageType,
          Adults,
          Children,
          SpecialRequests,
          ArrivalTime,
          DepartureTime,
          RoomID,
          id
        ]
      );

      if (reservationResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // 3. Get CustomerID from reservation
      const [reservation] = await connection.query(
        'SELECT CustomerID FROM reservations WHERE ReservationID = ?',
        [id]
      );
      const CustomerID = reservation[0].CustomerID;

      // 4. Update customer
      const [customerResult] = await connection.query(
        `UPDATE customers 
         SET Title = ?, FirstName = ?, LastName = ?, Email = ?, 
             Phone = ?, Country = ?, Nic_Passport = ?
         WHERE CustomerID = ?`,
        [
          Title,
          FirstName,
          LastName,
          Email,
          Phone,
          Country,
          Nic_Passport,
          CustomerID
        ]
      );

      if (customerResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      await connection.commit();
      res.json({ message: 'Reservation and customer updated successfully' });
    } catch (err) {
      await connection.rollback();
      console.error('Error updating reservation:', err);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      connection.release();
    }
  },

  // GET reservation by ID including customer details and room number
  getReservationById: async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT 
        r.ReservationID,
        DATE_FORMAT(r.CheckInDate, '%Y-%m-%d') AS CheckInDate,
        DATE_FORMAT(r.CheckOutDate, '%Y-%m-%d') AS CheckOutDate,
        r.Room_Status,
        r.PackageType,
        r.Adults,
        r.Children,
        r.SpecialRequests,
        r.ArrivalTime,
        r.DepartureTime,
        rm.RoomNumber,
        c.CustomerID,
        c.Title,
        c.FirstName,
        c.LastName,
        c.Email,
        c.Phone,
        c.Country,
        c.Nic_Passport
         FROM reservations r
         JOIN customers c ON r.CustomerID = c.CustomerID
         JOIN rooms rm ON r.RoomID = rm.RoomID
         WHERE r.ReservationID = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching reservation:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = reservationTableController;