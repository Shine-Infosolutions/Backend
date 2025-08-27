const RestaurantOrder = require("../models/RestaurantOrder");
const Item = require("../models/Items");
const KOT = require("../models/KOT");
const Bill = require("../models/Bill");

// Generate KOT number
const generateKOTNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await KOT.countDocuments({
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  });
  return `KOT${dateStr}${String(count + 1).padStart(3, "0")}`;
};

//createOrder
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // ✅ Validate order type
    if (!bookingId) {
      if (!req.body.staffName || !req.body.phoneNumber || !req.body.tableNo) {
        return res.status(400).json({
          error: "For non-booking orders, staffName, phoneNumber, and tableNo are required"
        });
      }
    }

    // ✅ Save Order
    const orderData = { ...req.body, createdBy: req.user?.id };
    const order = new RestaurantOrder(orderData);
    await order.save();

    // ✅ Auto-create KOT
    const kotNumber = await generateKOTNumber();

    // Items ke details fetch karna (name, rate/price)
    const kotItems = await Promise.all(
      order.items.map(async (item) => {
        const itemDetails = await Item.findById(item.itemId);
        return {
          itemId: item.itemId,
          itemName: itemDetails?.name || "Unknown Item",
          quantity: item.quantity,
          rate: itemDetails?.Price || 0,
          amount: (itemDetails?.Price || 0) * item.quantity,
        };
      })
    );

    const kot = new KOT({
      orderId: order._id,
      kotNumber,
      tableNo: order.tableNo || "Inhouse Booking", // agar table no nhi hai to fallback
      items: kotItems,
      createdBy: req.user?.id
    });
    await kot.save();

    res.status(201).json({
      success: true,
      order,
      kot
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all restaurant orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await RestaurantOrder.find()
      .populate("items.itemId", "name Price category Discount")
      .populate("createdBy", "name")
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

    const formatted = {
      _id: order._id,
      staffName: order.staffName,
      tableNo: order.tableNo,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        itemName: i.itemId?.name || 'Unknown',
        price: i.itemId?.Price || i.price,
        quantity: i.quantity,
        total: (i.itemId?.Price || i.price) * i.quantity
      }))
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by table number
exports.getOrdersByTable = async (req, res) => {
  try {
    const orders = await RestaurantOrder.find({ tableNo: req.params.tableNo })
      .populate("items.itemId", "name Price category Discount")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add items to existing order
exports.addItemsToOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const order = await RestaurantOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    let totalAmount = order.amount;
    
    for (const newItem of items) {
      const itemDetails = await Item.findById(newItem.itemId);
      if (!itemDetails) continue;
      
      const existingItemIndex = order.items.findIndex(
        item => item.itemId.toString() === newItem.itemId
      );
      
      if (existingItemIndex >= 0) {
        order.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        order.items.push({
          itemId: newItem.itemId,
          quantity: newItem.quantity,
          price: itemDetails.Price
        });
      }
      
      totalAmount += itemDetails.Price * newItem.quantity;
    }
    
    order.amount = totalAmount;
    await order.save();
    
    const kotNumber = await generateKOTNumber();
    const kotItems = await Promise.all(items.map(async (item) => {
      const itemDetails = await Item.findById(item.itemId);
      return {
        itemId: item.itemId,
        itemName: itemDetails?.name || 'Unknown Item',
        price: itemDetails?.Price || 0,
        quantity: item.quantity
      };
    }));
    
    const additionalKot = new KOT({
      orderId: order._id,
      kotNumber,
      tableNo: order.tableNo,
      items: kotItems,
      createdBy: req.user?.id
    });
    await additionalKot.save();
    
    res.json({ order, additionalKot });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Transfer order to different table
exports.transferTable = async (req, res) => {
  try {
    const { newTableNo, reason } = req.body;
    const order = await RestaurantOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const oldTableNo = order.tableNo;

    // Update order table number
    order.tableNo = newTableNo;
    order.transferHistory = order.transferHistory || [];
    order.transferHistory.push({
      fromTable: oldTableNo,
      toTable: newTableNo,
      reason: reason || "Customer request",
      transferredBy: req.user?.id || req.user?._id,
      transferredAt: new Date(),
    });

    await order.save();

    // Update all related KOTs
    await KOT.updateMany({ orderId: order._id }, { tableNo: newTableNo });

    // Update bill if exists
    await Bill.updateMany({ orderId: order._id }, { tableNo: newTableNo });

    res.json({
      message: `Order transferred from Table ${oldTableNo} to Table ${newTableNo}`,
      order,
    });
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
    if (!order) return res.status(404).json({ error: "Order not found" });
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
      const itemPrice = item.itemId?.Price || item.price;
      const discount = item.itemId?.Discount || 0;
      const discountAmount = (itemPrice * discount) / 100;
      const finalPrice = itemPrice - discountAmount;
      const itemTotal = finalPrice * item.quantity;
      subtotal += itemTotal;
      return {
        name: item.itemId?.name || 'Unknown',
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
