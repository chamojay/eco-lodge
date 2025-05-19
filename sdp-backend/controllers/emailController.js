const emailService = require('../services/emailService');
const pool = require('../config/db');

const emailController = {
  sendReservationConfirmation: async (req, res) => {
    try {
      const { reservationId } = req.params;
      
      // Fetch reservation details
      const [rows] = await pool.query(`
        SELECT 
          r.*,
          c.Email,
          c.Title,
          c.FirstName,
          c.LastName,
          rm.RoomNumber,
          pt.Name as PackageName
        FROM reservations r
        JOIN customers c ON r.CustomerID = c.CustomerID
        JOIN rooms rm ON r.RoomID = rm.RoomID
        JOIN package_types pt ON r.PackageID = pt.PackageID
        WHERE r.ReservationID = ?
      `, [reservationId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      const reservation = rows[0];
      await emailService.sendReservationConfirmation(reservation);
      
      res.json({ message: 'Confirmation email sent successfully' });
    } catch (error) {
      console.error('Error in sendReservationConfirmation:', error);
      res.status(500).json({ error: 'Failed to send confirmation email' });
    }
  }
};

module.exports = emailController;