const pool = require('../config/db');
const emailService = require('../services/emailService');

const ReservationController = {
  // Update checkAvailability to include room type information
  checkAvailability: async (req, res) => {
    try {
      const { checkIn, checkOut } = req.body;
      
      const [rooms] = await pool.query(
        `SELECT r.RoomNumber, rt.Name as TypeName, r.LocalPrice, r.ForeignPrice, r.MaxPeople 
         FROM rooms r
         JOIN room_types rt ON r.TypeID = rt.TypeID
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

  // Update createReservation to use PackageID instead of PackageType
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

      // Insert reservation with PackageID
      const [reservationResult] = await connection.query(
        `INSERT INTO reservations (
          CustomerID, RoomID, CheckInDate, CheckOutDate, TotalAmount, 
          PackageID, Adults, Children, SpecialRequests, 
          ArrivalTime, DepartureTime, Room_Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerResult.insertId,
          room[0].RoomID,
          reservationData.CheckInDate,
          reservationData.CheckOutDate,
          reservationData.TotalAmount,
          reservationData.PackageID,  // Changed from PackageType
          reservationData.Adults,
          reservationData.Children,
          reservationData.SpecialRequests,
          reservationData.ArrivalTime,
          reservationData.DepartureTime,
          'Confirmed'
        ]
      );

      // Fetch package type information for the email
      const [packageTypeResult] = await connection.query(
        `SELECT Name FROM package_types WHERE PackageID = ?`,
        [reservationData.PackageID]
      );

      // After successful reservation creation, send confirmation email
      try {
        await emailService.sendReservationConfirmation({
          ...reservationResult,
          Email: customerData.Email,
          Title: customerData.Title,
          FirstName: customerData.FirstName,
          LastName: customerData.LastName,
          RoomNumber: roomNumber,
          PackageName: packageTypeResult[0]?.Name || 'Room Only',
          CheckInDate: reservationData.CheckInDate,
          CheckOutDate: reservationData.CheckOutDate,
          ReservationID: reservationResult.insertId
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the reservation if email fails
      }

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
        `SELECT r.ReservationID, r.CheckInDate, r.CheckOutDate, 
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
    const { paymentMethod = 'Cash' } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Calculate total amount including extra charges and activities
        const [reservation] = await connection.query(
            `SELECT 
                r.TotalAmount,
                COALESCE(SUM(ec.Amount), 0) as ExtraChargesTotal,
                COALESCE(
                    (SELECT SUM(a.LocalPrice * ra.Participants)
                     FROM reservation_activities ra
                     JOIN activities a ON ra.ActivityID = a.ActivityID
                     WHERE ra.ReservationID = r.ReservationID), 0
                ) as ActivitiesTotal
            FROM reservations r
            LEFT JOIN extra_charges ec ON r.ReservationID = ec.ReservationID
            WHERE r.ReservationID = ?
            GROUP BY r.ReservationID`,
            [id]
        );

        const finalTotal = parseFloat(reservation[0].TotalAmount) + 
                         parseFloat(reservation[0].ExtraChargesTotal) + 
                         parseFloat(reservation[0].ActivitiesTotal);

        // Insert payment record with Source as 'Reception'
        await connection.query(
            'INSERT INTO payments (Amount, PaymentMethod, ReservationID, Source) VALUES (?, ?, ?, ?)',
            [finalTotal, paymentMethod, id, 'Reception']
        );

        // Update reservation status
        await connection.query(
            'UPDATE reservations SET Room_Status = "Completed" WHERE ReservationID = ?',
            [id]
        );

        await connection.commit();
        res.json({ 
            success: true,
            totalAmount: finalTotal,
            message: 'Checkout completed and payment recorded'
        });
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

  // Update getAllRoomsStatus to include more room type details
  getAllRoomsStatus: async (req, res) => {
    try {
      const [rooms] = await pool.query(
        `SELECT 
            r.RoomID,
            r.RoomNumber, 
            r.TypeID,
            rt.Name as TypeName,
            rt.ImagePath as TypeImagePath,
            rt.Description as TypeDescription,
            r.LocalPrice, 
            r.ForeignPrice, 
            r.MaxPeople,
            r.Description,
            COALESCE(res.Room_Status, 'Completed') AS Room_Status
         FROM rooms r
         LEFT JOIN room_types rt ON r.TypeID = rt.TypeID
         LEFT JOIN reservations res 
         ON r.RoomID = res.RoomID 
         AND res.Room_Status = 'Confirmed' 
         AND CURRENT_DATE BETWEEN res.CheckInDate AND res.CheckOutDate
         GROUP BY r.RoomID`
      );

      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms status:', error);
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