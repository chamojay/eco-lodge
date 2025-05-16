const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', auth(['ADMIN']), authController.register);
router.post('/login', authController.login);

module.exports = router;