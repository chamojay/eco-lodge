const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const roomTypeController = require('../controllers/roomTypeController');

router.get('/', roomTypeController.getAllTypes);
router.post('/', upload.single('image'), roomTypeController.createType);
router.put('/:id', upload.single('image'), roomTypeController.updateType);
router.delete('/:id', roomTypeController.deleteType);

module.exports = router;