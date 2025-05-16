const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload');
const menuController = require('../../controllers/Restaurant/menuController');

router.get('/items', menuController.getMenuItems);
router.post('/items', upload.single('image'), menuController.addMenuItem);
router.put('/items', upload.single('image'), menuController.updateMenuItem);
router.get('/categories', menuController.getCategories);
router.post('/categories', menuController.addCategory);

module.exports = router;
