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
          COALESCE(pt.Name, 'Not Set') as PackageName,
          COALESCE(pt.PriceMultiplier, 1) as PriceMultiplier,
          r.Adults,
          r.Children,
          r.SpecialRequests,
          r.ArrivalTime,
          r.DepartureTime,
          COALESCE(rm.RoomNumber, 'Not Assigned') as RoomNumber,
          COALESCE(rt.Name, 'Not Set') as RoomType,
          COALESCE(c.CustomerID, 0) as CustomerID,
          COALESCE(c.Title, '') as Title,
          COALESCE(c.FirstName, '') as FirstName,
          COALESCE(c.LastName, '') as LastName,
          COALESCE(c.Email, '') as Email,
          COALESCE(c.Phone, '') as Phone,
          COALESCE(c.Country, '') as Country,
          COALESCE(c.NIC, '') as NIC,
          COALESCE(c.PassportNumber, '') as PassportNumber,
          CASE 
            WHEN r.CheckInDate <= CURDATE() AND r.CheckOutDate >= CURDATE() THEN 'Active'
            WHEN r.CheckInDate > CURDATE() THEN 'Future'
            WHEN r.CheckOutDate < CURDATE() THEN 'Past'
            ELSE 'Unknown'
          END AS Status
        FROM reservations r
        LEFT JOIN customers c ON r.CustomerID = c.CustomerID
        LEFT JOIN rooms rm ON r.RoomID = rm.RoomID
        LEFT JOIN room_types rt ON rm.TypeID = rt.TypeID
        LEFT JOIN package_types pt ON r.PackageID = pt.PackageID
        ORDER BY 
          CASE 
            WHEN r.CheckInDate <= CURDATE() AND r.CheckOutDate >= CURDATE() THEN 1
            WHEN r.CheckInDate > CURDATE() THEN 2
            WHEN r.CheckOutDate < CURDATE() THEN 3
            ELSE 4
          END,
          r.CheckInDate DESC`
      );
      
      console.log(`Found ${rows.length} reservations`); // Debug log
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
      PackageID, // Changed from PackageType
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
      NIC,
      PassportNumber
    } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [room] = await connection.query(
        'SELECT RoomID FROM rooms WHERE RoomNumber = ?',
        [RoomNumber]
      );
      if (room.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }
      const RoomID = room[0].RoomID;

      const [reservationResult] = await connection.query(
        `UPDATE reservations 
         SET CheckInDate = ?, CheckOutDate = ?, Room_Status = ?, 
             PackageID = ?, Adults = ?, Children = ?, SpecialRequests = ?, 
             ArrivalTime = ?, DepartureTime = ?, RoomID = ?
         WHERE ReservationID = ?`,
        [
          CheckInDate,
          CheckOutDate,
          Room_Status,
          PackageID,
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

      const [reservation] = await connection.query(
        'SELECT CustomerID FROM reservations WHERE ReservationID = ?',
        [id]
      );
      const CustomerID = reservation[0].CustomerID;

      const [customerResult] = await connection.query(
        `UPDATE customers 
         SET Title = ?, FirstName = ?, LastName = ?, Email = ?, 
             Phone = ?, Country = ?, NIC = ?, PassportNumber = ?
         WHERE CustomerID = ?`,
        [
          Title,
          FirstName,
          LastName,
          Email,
          Phone,
          Country,
          NIC,
          PassportNumber,
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
          pt.PackageID,
          pt.Name as PackageName,
          pt.PriceMultiplier,
          r.Adults,
          r.Children,
          r.SpecialRequests,
          r.ArrivalTime,
          r.DepartureTime,
          rm.RoomNumber,
          rt.Name as RoomType,
          c.CustomerID,
          c.Title,
          c.FirstName,
          c.LastName,
          c.Email,
          c.Phone,
          c.Country,
          c.NIC,
          c.PassportNumber
         FROM reservations r
         JOIN customers c ON r.CustomerID = c.CustomerID
         JOIN rooms rm ON r.RoomID = rm.RoomID
         JOIN room_types rt ON rm.TypeID = rt.TypeID
         JOIN package_types pt ON r.PackageID = pt.PackageID
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
