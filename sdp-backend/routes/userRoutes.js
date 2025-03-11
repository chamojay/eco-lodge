const express = require('express');
const { addUser, loginUser } = require('../controllers/userController');

const router = express.Router();

// POST request for adding user
router.post('/add', addUser);
router.post('/login', loginUser);

module.exports = router;
