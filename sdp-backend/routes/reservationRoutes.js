const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/check-availability', reservationController.checkRoomAvailability);
router.post('/create', reservationController.createReservation);
router.post('/checkout', reservationController.completeReservation);

module.exports = router;
