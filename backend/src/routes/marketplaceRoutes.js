const express = require('express');

const marketplaceController = require('../controllers/marketplaceController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', marketplaceController.listMarketplaceItems);
router.post('/', requireAuth, marketplaceController.createMarketplaceItem);

module.exports = router;
