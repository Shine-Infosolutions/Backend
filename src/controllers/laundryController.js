// controllers/laundryController.js
const Laundry = require("../models/Laundry");
const LaundryRate = require("../models/LaundryRate");
const Booking = require("../models/Booking");

// — Helper: Calculate items total & lock itemName from rate table
const calculateItems = async (items) => {
  const rateIds = items.map(i => i.rateId);
  const rates = await LaundryRate.find({ _id: { $in: rateIds } });
  const rateMap = rates.reduce((acc, r) => {
    acc[r._id.toString()] = r;
    return acc;
  }, {});

  let total = 0;
  const processedItems = items.map(i => {
    const rateDoc = rateMap[i.rateId.toString()];
    if (!rateDoc) throw new Error(`Rate not found for ID: ${i.rateId}`);
    const calcAmount = rateDoc.rate * i.quantity;
    total += calcAmount;
    return {
      ...i,
      itemName: rateDoc.itemName,
      calculatedAmount: calcAmount
    };
  });

  return { processedItems, total };
};

// — Create Laundry Order 
exports.createLaundryOrder = async (req, res) => {
  try {
    const { bookingId, items, roomNumber } = req.body;

    if (!bookingId || !items?.length) {
      return res.status(400).json({ message: "Booking ID and items are required" });
    }

    const bookingExists = await Booking.findById(bookingId);
    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { processedItems, total } = await calculateItems(items);

    const laundryOrder = await Laundry.create({
      bookingId,
      roomNumber: roomNumber || bookingExists.roomNumber,
      requestedByName: bookingExists.guestName,
      items: processedItems,
      totalAmount: total,
      isBillable: true,
      billStatus: "unpaid",
    });

    res.status(201).json(laundryOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Get All Orders
exports.getAllLaundryOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.urgent === "true") filter.isUrgent = true;

    const orders = await Laundry.find(filter)
      .populate("bookingId", "guestName roomNumber checkInDate checkOutDate")
      .populate("items.rateId");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Get By ID
exports.getLaundryById = async (req, res) => {
  try {
    const order = await Laundry.findById(req.params.id)
      .populate("bookingId", "guestName roomNumber checkInDate checkOutDate")
      .populate("items.rateId");

    if (!order) return res.status(404).json({ message: "Laundry order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Get Laundry by GRC No or Room Number
exports.getLaundryByGRCOrRoom = async (req, res) => {
  try {
    const { grcNo, roomNumber } = req.params;
    if (!grcNo && !roomNumber) {
      return res.status(400).json({ message: "Please provide GRC No or Room Number" });
    }

    const query = {};
    if (grcNo) query.grcNo = grcNo;
    if (roomNumber) query.roomNumber = roomNumber;

    const orders = await Laundry.find(query)
      .populate("bookingId", "guestName checkInDate checkOutDate")
      .populate("items.rateId");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Update single item status/notes
exports.updateLaundryItemStatus = async (req, res) => {
  try {
    const { status, itemNotes } = req.body;
    const { laundryId, itemId } = req.params;

    const order = await Laundry.findById(laundryId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (status) item.status = status;
    if (itemNotes) item.itemNotes = itemNotes;

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Update Entire Order
exports.updateLaundryOrder = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.items?.length) {
      const { processedItems, total } = await calculateItems(req.body.items);
      updateData.items = processedItems;
      updateData.totalAmount = total;
    }

    const updatedOrder = await Laundry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("items.rateId");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Laundry order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Add Items
exports.addItemsToLaundryOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Items are required" });

    const laundryOrder = await Laundry.findById(req.params.id);
    if (!laundryOrder) return res.status(404).json({ message: "Order not found" });

    const { processedItems, total } = await calculateItems(items);

    laundryOrder.items.push(...processedItems);
    laundryOrder.totalAmount += total;
    await laundryOrder.save();

    res.json(laundryOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Cancel Order
exports.cancelLaundryOrder = async (req, res) => {
  try {
    const order = await Laundry.findByIdAndUpdate(
      req.params.id,
      { isCancelled: true, laundryStatus: "cancelled" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Mark Returned
exports.markLaundryReturned = async (req, res) => {
  try {
    const order = await Laundry.findByIdAndUpdate(
      req.params.id,
      { isReturned: true },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Report Damage/Loss
exports.reportDamageOrLoss = async (req, res) => {
  try {
    const { damageReported, damageNotes, isLost, lossNote } = req.body;
    const order = await Laundry.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (typeof damageReported !== "undefined") order.damageReported = damageReported;
    if (damageNotes) order.damageNotes = damageNotes;
    if (typeof isLost !== "undefined") order.isLost = isLost;
    if (lossNote) order.lossNote = lossNote;

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Delete Order
exports.deleteLaundry = async (req, res) => {
  try {
    await Laundry.findByIdAndDelete(req.params.id);
    res.json({ message: "Laundry order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
