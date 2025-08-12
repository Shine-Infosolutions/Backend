const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Add sample room inventory items
router.post('/seed', authMiddleware(['admin']), async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');
    
    const roomItems = [
      { name: 'Towels', category: 'linen', currentStock: 50, unit: 'piece', minThreshold: 10, reorderQuantity: 20, costPerUnit: 15 },
      { name: 'Bed Sheets', category: 'linen', currentStock: 30, unit: 'set', minThreshold: 5, reorderQuantity: 10, costPerUnit: 200 },
      { name: 'Pillows', category: 'linen', currentStock: 40, unit: 'piece', minThreshold: 8, reorderQuantity: 15, costPerUnit: 150 },
      { name: 'Shampoo', category: 'toiletry', currentStock: 25, unit: 'bottle', minThreshold: 5, reorderQuantity: 10, costPerUnit: 50 },
      { name: 'Soap', category: 'toiletry', currentStock: 35, unit: 'piece', minThreshold: 10, reorderQuantity: 20, costPerUnit: 25 },
      { name: 'Toilet Paper', category: 'toiletry', currentStock: 100, unit: 'roll', minThreshold: 20, reorderQuantity: 50, costPerUnit: 10 },
      { name: 'TV Remote', category: 'amenity', currentStock: 20, unit: 'piece', minThreshold: 2, reorderQuantity: 5, costPerUnit: 300 },
      { name: 'Air Freshener', category: 'amenity', currentStock: 15, unit: 'bottle', minThreshold: 3, reorderQuantity: 10, costPerUnit: 80 }
    ];
    
    await Inventory.insertMany(roomItems);
    res.json({ success: true, message: 'Room inventory items added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;