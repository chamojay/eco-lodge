const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationController');

// Route to check room availability based on check-in and check-out dates
router.post('/availability', controller.checkAvailability);

// Route to create a new reservation
router.post('/', controller.createReservation);

// Route to get all active reservations
router.get('/active', controller.getActiveReservations);

// Route to complete checkout and update room status
router.put('/checkout/:id', controller.completeCheckout);

router.get('/room-status',controller.getAllRoomsStatus);

module.exports = router;
