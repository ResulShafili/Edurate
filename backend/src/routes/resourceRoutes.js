const express = require('express');

const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadResource } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', resourceController.listResources);
router.post('/', requireAuth, uploadResource.single('file'), resourceController.createResource);

module.exports = router;
