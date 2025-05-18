const express = require('express');
const router = express.Router();
const packageTypeController = require('../controllers/packageTypeController');
const upload = require('../middlewares/upload');

router.get('/', packageTypeController.getAllTypes);
router.post('/', upload.single('image'), packageTypeController.createType);
router.put('/:id', upload.single('image'), packageTypeController.updateType);
router.delete('/:id', packageTypeController.deleteType);

module.exports = router;