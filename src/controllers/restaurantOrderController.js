const RestaurantOrder = require('../models/RestaurantOrder');
const Table = require('../models/Table');
const Item = require('../models/Items');

// Get available items
exports.getAvailableItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' }).sort({ name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create restaurant order
exports.createOrder = async (req, res) => {
  try {
    const order = new RestaurantOrder({
      ...req.body,
      createdBy: req.user.id
    });
    await order.save();
    
    // Update table status to occupied
    if (req.body.tableNo) {
      await Table.findOneAndUpdate(
        { tableNumber: req.body.tableNo },
        { status: 'occupied' }
      );
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, tableNo } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (tableNo) filter.tableNo = tableNo;
    
    const orders = await RestaurantOrder.find(filter)
      .populate('createdBy', 'username')
      .populate('items.itemId', 'name Price category')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await RestaurantOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update table status when order is completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNo },
        { status: 'available' }
      );
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await RestaurantOrder.findById(orderId)
      .populate('createdBy', 'username')
      .populate('items.itemId', 'name Price category');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};