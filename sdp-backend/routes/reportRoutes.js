const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Test route to check API
router.get('/test', (req, res) => {
  res.json({ message: 'Reports API is working' });
});

// Reservation reports
router.get('/reservations', reportController.getReservationReport);

// Activity reports
router.get('/activities', reportController.getActivitiesReport);

// Payment reports
router.get('/payments', reportController.getPaymentsReport);

// Extra charges reports
router.get('/extra-charges', reportController.getExtraChargesReport);

// Customer reports
router.get('/customers', reportController.getCustomersReport);

// PDF generation
router.post('/generate-pdf', reportController.generatePDF);

module.exports = router;