const express = require('express');
const router = express.Router();
const roomStatusController = require('../controllers/roomStatusController');

router.get('/:RoomID', roomStatusController.getRoomStatus);

module.exports = router;
