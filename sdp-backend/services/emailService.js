const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use an app-specific password
  }
});

const emailService = {
  sendReservationConfirmation: async (reservation) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: reservation.Email,
        subject: 'Reservation Confirmation - Eco Lodge',
        html: `
          <h1>Reservation Confirmation</h1>
          <p>Dear ${reservation.Title} ${reservation.FirstName} ${reservation.LastName},</p>
          <p>Your reservation has been confirmed. Here are the details:</p>
          <ul>
            <li>Reservation ID: ${reservation.ReservationID}</li>
            <li>Check-in Date: ${new Date(reservation.CheckInDate).toLocaleDateString()}</li>
            <li>Check-out Date: ${new Date(reservation.CheckOutDate).toLocaleDateString()}</li>
            <li>Room Number: ${reservation.RoomNumber}</li>
            <li>Package Type: ${reservation.PackageName}</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Eco Lodge Team</p>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};

module.exports = emailService;