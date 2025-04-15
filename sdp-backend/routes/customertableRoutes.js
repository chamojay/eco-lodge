const express = require('express');
const router = express.Router();
const customerTableController = require('../controllers/customerTableController');

router.get('/', customerTableController.getAllCustomers);
router.put('/:id', customerTableController.updateCustomer);

module.exports = router;
