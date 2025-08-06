// routes/roomInventoryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomInventory');

router.post('/assign', controller.assignItemToRoom);
router.get('/:roomId', controller.getRoomInventory);
router.patch('/:id/status', controller.updateItemStatus);
router.delete('/:id/remove', controller.removeItemFromRoom);

module.exports = router;
