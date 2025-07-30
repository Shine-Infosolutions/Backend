const RestaurantOrder = require('../models/RestaurantOrder');
const Item = require('../models/Items');
const KOT = require('../models/KOT');

// Generate KOT number
const generateKOTNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await KOT.countDocuments({
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });
  return `KOT${dateStr}${String(count + 1).padStart(3, '0')}`;
};

// Create a new restaurant order
exports.createOrder = async (req, res) => {
  try {
    // Automatically set createdBy from authenticated user
    const orderData = { ...req.body, createdBy: req.user?._id };
    const order = new RestaurantOrder(orderData);
    await order.save();
    
    // Auto-create KOT for the order
    const kotNumber = await generateKOTNumber();
    const kotItems = await Promise.all(order.items.map(async (item) => {
      const itemDetails = await Item.findById(item.itemId);
      return {
        itemId: item.itemId,
        itemName: itemDetails?.name || 'Unknown Item',
        quantity: item.quantity
      };
    }));
    
    const kot = new KOT({
      orderId: order._id,
      kotNumber,
      tableNo: order.tableNo,
      items: kotItems,
      createdBy: req.user?._id
    });
    await kot.save();
    
    res.status(201).json({ order, kot });
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

// Add items to existing order
exports.addItemsToOrder = async (req, res) => {
  try {
    const { items } = req.body; // [{ itemId, quantity }]
    const order = await RestaurantOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    let totalAmount = order.amount;
    
    // Process each new item
    for (const newItem of items) {
      const itemDetails = await Item.findById(newItem.itemId);
      if (!itemDetails) continue;
      
      // Check if item already exists in order
      const existingItemIndex = order.items.findIndex(
        item => item.itemId.toString() === newItem.itemId
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        order.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item to order
        order.items.push({
          itemId: newItem.itemId,
          quantity: newItem.quantity
        });
      }
      
      // Add to total amount
      totalAmount += itemDetails.Price * newItem.quantity;
    }
    
    order.amount = totalAmount;
    await order.save();
    
    // Create additional KOT for new items
    const kotNumber = await generateKOTNumber();
    const kotItems = await Promise.all(items.map(async (item) => {
      const itemDetails = await Item.findById(item.itemId);
      return {
        itemId: item.itemId,
        itemName: itemDetails?.name || 'Unknown Item',
        quantity: item.quantity
      };
    }));
    
    const additionalKot = new KOT({
      orderId: order._id,
      kotNumber,
      tableNo: order.tableNo,
      items: kotItems,
      createdBy: req.user?._id
    });
    await additionalKot.save();
    
    res.json({ order, additionalKot });
  } catch (error) {
    res.status(400).json({ error: error.message });
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