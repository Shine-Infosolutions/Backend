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

module.exports = router;