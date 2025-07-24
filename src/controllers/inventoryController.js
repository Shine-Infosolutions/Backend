const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

// Get all inventory items
exports.getItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create inventory item
exports.createItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update item stock
exports.updateStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { currentStock } = req.body;
    
    const item = await Inventory.findByIdAndUpdate(
      itemId,
      { currentStock },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('inventoryId', 'name')
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { inventoryId, transactionType, quantity, reason, roomNumber } = req.body;
    
    // Get current stock before transaction
    const item = await Inventory.findById(inventoryId);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    const previousStock = item.currentStock;
    let newStock;
    
    // Calculate new stock based on transaction type
    if (transactionType === 'restock' || transactionType === 'return') {
      newStock = previousStock + parseInt(quantity);
    } else if (transactionType === 'use' || transactionType === 'transfer') {
      newStock = previousStock - parseInt(quantity);
    } else if (transactionType === 'adjustment') {
      newStock = parseInt(quantity);
    }
    
    const transaction = new InventoryTransaction({
      inventoryId,
      transactionType,
      quantity,
      reason,
      roomNumber,
      previousStock,
      newStock,
      userId: req.user.id
    });
    
    await transaction.save();
    
    // Update inventory stock
    item.currentStock = newStock;
    await item.save();
    
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get transaction history for specific inventory item
exports.getTransactionHistory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    
    const transactions = await InventoryTransaction.find({ inventoryId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};