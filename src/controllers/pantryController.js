const PantryItem = require('../models/PantryItem');
const PantryOrder = require('../models/PantryOrder');

// Get all pantry items
exports.getAllPantryItems = async (req, res) => {
  try {
    const items = await PantryItem.find().sort({ name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get low stock pantry items
exports.getLowStockPantryItems = async (req, res) => {
  try {
    const items = await PantryItem.find({ isLowStock: true }).sort({ name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create pantry item
exports.createPantryItem = async (req, res) => {
  try {
    const item = new PantryItem(req.body);
    await item.save();
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update pantry item
exports.updatePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete pantry item
exports.deletePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    res.json({ success: true, message: 'Pantry item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create pantry order (kitchen to pantry or pantry to reception)
exports.createPantryOrder = async (req, res) => {
  try {
    const order = new PantryOrder({
      ...req.body,
      requestedBy: req.user.id
    });
    await order.save();
    await order.populate('requestedBy', 'username email');
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get pantry orders
exports.getPantryOrders = async (req, res) => {
  try {
    const { orderType, status } = req.query;
    const filter = {};
    
    if (orderType) filter.orderType = orderType;
    if (status) filter.status = status;
    
    const orders = await PantryOrder.find(filter)
      .populate('requestedBy', 'username email')
      .populate('approvedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update pantry order status
exports.updatePantryOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PantryOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    
    if (status === 'approved') {
      order.approvedBy = req.user.id;
      order.approvedDate = new Date();
    } else if (status === 'fulfilled') {
      order.fulfilledDate = new Date();
      
      // Update pantry item stock if fulfilled
      for (const item of order.items) {
        await PantryItem.findByIdAndUpdate(
          item.pantryItemId,
          { $inc: { currentStock: -item.quantity } }
        );
      }
    }
    
    await order.save();
    await order.populate('requestedBy approvedBy', 'username email');
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update pantry item stock
exports.updatePantryStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    const item = await PantryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    if (operation === 'add') {
      item.currentStock += quantity;
    } else if (operation === 'subtract') {
      item.currentStock = Math.max(0, item.currentStock - quantity);
    }
    
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};