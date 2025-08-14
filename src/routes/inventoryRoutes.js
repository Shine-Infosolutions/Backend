const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all inventory items
router.get('/items', authMiddleware(['admin', 'staff']), inventoryController.getItems);

// Create inventory item
router.post('/items', authMiddleware(['admin', 'staff']), inventoryController.createItem);

// Update item stock
router.put('/items/:itemId/stock', authMiddleware(['admin', 'staff']), inventoryController.updateStock);

// Get all transactions
router.get('/transactions', authMiddleware(['admin', 'staff']), inventoryController.getTransactions);

// Create transaction
router.post('/transactions', authMiddleware(['admin', 'staff']), inventoryController.createTransaction);

// Get transaction history for specific item
router.get('/transactions/:inventoryId', authMiddleware(['admin', 'staff']), inventoryController.getTransactionHistory);

// Room inventory checklist routes
router.get('/room/:roomId/checklist', authMiddleware(['admin', 'staff']), inventoryController.getRoomChecklist);
router.post('/room/:roomId/checklist', authMiddleware(['admin', 'staff']), inventoryController.createRoomChecklist);
router.put('/checklist/:checklistId', authMiddleware(['admin', 'staff']), inventoryController.updateChecklist);

// Debug route to check inventory
router.get('/debug/count', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');
    const count = await Inventory.countDocuments();
    const items = await Inventory.find().limit(5);
    res.json({ count, sampleItems: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;