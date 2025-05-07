const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Activities routes
router.post('/', activityController.createActivity);
router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

// Reservation Activities routes
router.post('/reservation', activityController.addActivityToReservation);
router.get('/reservation/:reservationId', activityController.getActivitiesForReservation);
router.put('/reservation/:id', activityController.updateReservationActivity);
router.delete('/reservation/:id', activityController.deleteReservationActivity);

module.exports = router;