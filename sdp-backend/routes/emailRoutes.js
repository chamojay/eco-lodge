const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/reservation-confirmation/:reservationId', emailController.sendReservationConfirmation);

module.exports = router;