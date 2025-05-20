const pool = require('../config/db');
const emailService = require('../services/emailService');

const ReservationController = {
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

  createReservation: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { roomNumber, customerData, reservationData } = req.body;

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

      const [room] = await connection.query(
        'SELECT RoomID FROM rooms WHERE RoomNumber = ?',
        [roomNumber]
      );

      if (room.length === 0) {
        throw new Error('Room not found');
      }

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
          reservationData.PackageID,
          reservationData.Adults,
          reservationData.Children,
          reservationData.SpecialRequests,
          reservationData.ArrivalTime,
          reservationData.DepartureTime,
          'Confirmed'
        ]
      );

      const [packageTypeResult] = await connection.query(
        `SELECT Name FROM package_types WHERE PackageID = ?`,
        [reservationData.PackageID]
      );

      try {
        await emailService.sendReservationConfirmation({
          ...reservationResult,
          Email: customerData.Email,
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

  createWebReservation: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { roomNumber, customerData, reservationData } = req.body;

      const [customerResult] = await connection.query(
        `INSERT INTO customers (FirstName, LastName, Email, Phone, Country, NIC, PassportNumber) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          customerData.FirstName,
          customerData.LastName,
          customerData.Email,
          customerData.Phone,
          customerData.Country,
          customerData.Nic,
          customerData.Passport
        ]
      );

      const [room] = await connection.query(
        'SELECT RoomID FROM rooms WHERE RoomNumber = ?',
        [roomNumber]
      );

      if (room.length === 0) {
        throw new Error('Room not found');
      }

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
          reservationData.PackageID,
          reservationData.Adults,
          reservationData.Children,
          reservationData.SpecialRequests,
          reservationData.ArrivalTime,
          reservationData.DepartureTime,
          'Confirmed'
        ]
      );

      await connection.query(
        `INSERT INTO payments (Amount, PaymentMethod, ReservationID, Source, PaymentDate) 
         VALUES (?, ?, ?, ?, NOW())`,
        [
          reservationData.TotalAmount,
          'Online',
          reservationResult.insertId,
          'Web'
        ]
      );

      const [packageTypeResult] = await connection.query(
        `SELECT Name FROM package_types WHERE PackageID = ?`,
        [reservationData.PackageID]
      );

      try {
        await emailService.sendReservationConfirmation({
          ...reservationResult,
          Email: customerData.Email,
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

  completeCheckout: async (req, res) => {
    const { id } = req.params;
    const { paymentMethod = 'Cash' } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if a payment exists for this reservation
      const [existingPayments] = await connection.query(
        'SELECT SUM(Amount) as PaidAmount FROM payments WHERE ReservationID = ? AND Source = ?',
        [id, 'Web']
      );

      const hasPaidOnline = existingPayments[0].PaidAmount > 0;
      const paidAmount = hasPaidOnline ? parseFloat(existingPayments[0].PaidAmount) : 0;

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

      if (!reservation[0]) {
        throw new Error('Reservation not found');
      }

      // Calculate final total: include TotalAmount only if not paid online
      const finalTotal = (hasPaidOnline ? 0 : parseFloat(reservation[0].TotalAmount)) + 
                        parseFloat(reservation[0].ExtraChargesTotal) + 
                        parseFloat(reservation[0].ActivitiesTotal);

      // Insert payment record only if there is an amount to pay
      if (finalTotal > 0) {
        await connection.query(
          'INSERT INTO payments (Amount, PaymentMethod, ReservationID, Source, PaymentDate) VALUES (?, ?, ?, ?, NOW())',
          [finalTotal, paymentMethod, id, 'Reception']
        );
      }

      // Update reservation status
      await connection.query(
        'UPDATE reservations SET Room_Status = "Completed" WHERE ReservationID = ?',
        [id]
      );

      await connection.commit();
      res.json({ 
        success: true,
        totalAmount: finalTotal,
        baseAmountPaidOnline: hasPaidOnline,
        paidAmount: paidAmount,
        message: hasPaidOnline ? 'Checkout completed, base amount was paid online' : 'Checkout completed and payment recorded'
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