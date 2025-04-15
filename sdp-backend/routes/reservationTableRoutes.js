const express = require('express');
const router = express.Router();
const reservationTableController = require('../controllers/reservationTableController');

router.get('/', reservationTableController.getAllReservations);
router.put('/:id', reservationTableController.updateReservation);
router.get('/:id', reservationTableController.getReservationById);


module.exports = router;
