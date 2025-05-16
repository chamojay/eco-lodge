const express = require('express');
const router = express.Router();
const payment = require('../../controllers/Restaurant/paymentController');

router.post('/', payment.addPayment);
router.get('/', payment.getPayments);

module.exports = router;
