const express = require('express');
const router = express.Router();
const ExtraChargeTypeController = require('../controllers/extraChargeTypeController');
const ExtraChargeController = require('../controllers/extraChargeController');

// ===== Extra Charge Types =====

// GET all extra charge types
router.get('/types', ExtraChargeTypeController.getAllTypes);

// POST a new extra charge type
router.post('/types', ExtraChargeTypeController.createType);

// PUT update an existing charge type
router.put('/types/:id', ExtraChargeTypeController.updateType);

// DELETE a charge type
router.delete('/types/:id', ExtraChargeTypeController.deleteType);

// ===== Extra Charges =====

// GET charges for a specific reservation
router.get('/:reservationId', ExtraChargeController.getChargesByReservation);

// POST a new extra charge
router.post('/', ExtraChargeController.addCharge);

// PUT update an existing extra charge
router.put('/:id', ExtraChargeController.updateCharge);

// DELETE an extra charge
router.delete('/:id', ExtraChargeController.deleteCharge);

module.exports = router;
