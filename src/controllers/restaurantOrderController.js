const RestaurantOrder = require('../models/RestaurantOrder');
const Item = require('../models/Items');

// Create a new restaurant order
exports.createOrder = async (req, res) => {
  try {
    // Automatically set createdBy from authenticated user
    const orderData = { ...req.body, createdBy: req.user._id };
    const order = new RestaurantOrder(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all restaurant orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await RestaurantOrder.find()
      .populate('items.itemId', 'name Price category Discount')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single order by ID
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await RestaurantOrder.findById(req.params.id)
      .populate('items.itemId', 'name Price category Discount')
      .populate('createdBy', 'name');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by table number
exports.getOrdersByTable = async (req, res) => {
  try {
    const orders = await RestaurantOrder.find({ tableNo: req.params.tableNo })
      .populate('items.itemId', 'name Price category Discount')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await RestaurantOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate invoice for an order
exports.generateInvoice = async (req, res) => {
  try {
    const order = await RestaurantOrder.findById(req.params.id)
      .populate('items.itemId', 'name Price category Discount')
      .populate('createdBy', 'name');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    let subtotal = 0;
    const invoiceItems = order.items.map(item => {
      const itemPrice = item.itemId.Price;
      const discount = item.itemId.Discount || 0;
      const discountAmount = (itemPrice * discount) / 100;
      const finalPrice = itemPrice - discountAmount;
      const itemTotal = finalPrice * item.quantity;
      subtotal += itemTotal;
      return {
        name: item.itemId.name,
        price: itemPrice,
        discount: discount,
        finalPrice: finalPrice,
        quantity: item.quantity,
        total: itemTotal
      };
    });
    const orderDiscount = order.discount || 0;
    const orderDiscountAmount = (subtotal * orderDiscount) / 100;
    const finalAmount = subtotal - orderDiscountAmount;
    const invoice = {
      orderId: order._id,
      tableNo: order.tableNo,
      staffName: order.staffName,
      phoneNumber: order.phoneNumber,
      items: invoiceItems,
      subtotal: subtotal,
      orderDiscount: orderDiscount,
      orderDiscountAmount: orderDiscountAmount,
      finalAmount: finalAmount,
      status: order.status,
      createdAt: order.createdAt,
      notes: order.notes,
      couponCode: order.couponCode,
      isMembership: order.isMembership,
      isLoyalty: order.isLoyalty
    };
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};