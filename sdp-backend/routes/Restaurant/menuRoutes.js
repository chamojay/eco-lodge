const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload');
const menuController = require('../../controllers/Restaurant/menuController');

router.get('/items', menuController.getMenuItems);
router.post('/items', upload.single('image'), menuController.addMenuItem);
router.put('/items/:id', upload.single('image'), menuController.updateMenuItem);  // Changed to include :id
router.delete('/items/:id', menuController.deleteMenuItem);
router.get('/categories', menuController.getCategories);
router.post('/categories', menuController.addCategory);
router.delete('/categories/:id', menuController.deleteCategory);
router.put('/categories/:id', menuController.updateCategory);

module.exports = router;
