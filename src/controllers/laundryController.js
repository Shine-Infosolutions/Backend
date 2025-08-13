// controllers/laundryController.js
const Laundry = require("../models/Laundry");
const LaundryRate = require("../models/LaundryRate");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// — Create Laundry Order
exports.createLaundryOrder = async (req, res) => {
  try {
    const { bookingId, items, roomNumber } = req.body;

    if (!bookingId || !items?.length) {
      return res.status(400).json({ message: "Booking ID and items are required" });
    }

    // Auto-calculate item amounts from rateId
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const rateDoc = await LaundryRate.findById(item.rateId);
        if (!rateDoc) throw new Error(`Rate not found for ID: ${item.rateId}`);
        return {
          ...item,
          calculatedAmount: rateDoc.rate * item.quantity,
        };
      })
    );

    const totalAmount = populatedItems.reduce((sum, i) => sum + i.calculatedAmount, 0);

    const laundryOrder = await Laundry.create({
      ...req.body,
      items: populatedItems,
      totalAmount,
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

    const orders = await Laundry.find(filter).populate("bookingId").populate("items.rateId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Get By ID
exports.getLaundryById = async (req, res) => {
  try {
    const order = await Laundry.findById(req.params.id).populate("bookingId").populate("items.rateId");
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

    // items array me se itemId match kar ke item find karo
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

// — Update Entire Order with recalculation
exports.updateLaundryOrder = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If items array is being updated, recalc all amounts
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      // 1. Get all rate IDs from the incoming items
      const rateIds = req.body.items.map(i => i.rateId);
      
      // 2. Fetch all rate docs in one query
      const rates = await LaundryRate.find({ _id: { $in: rateIds } });
      const rateMap = rates.reduce((acc, r) => {
        acc[r._id.toString()] = r; // store whole doc for both rate + itemName
        return acc;
      }, {});
      
      // 3. Loop through items to recalc amounts and add itemName
      let total = 0;
      const recalculatedItems = req.body.items.map(i => {
        const rateDoc = rateMap[i.rateId.toString()];
        if (!rateDoc) {
          throw new Error(`Rate not found for ID: ${i.rateId}`);
        }
        const calcAmount = rateDoc.rate * i.quantity;
        total += calcAmount;
        return {
          ...i,
          itemName: rateDoc.itemName, // lock name from rate table
          calculatedAmount: calcAmount
        };
      });

      updateData.items = recalculatedItems;
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
    console.error("Error updating laundry order:", err);
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

    const newItems = await Promise.all(
      items.map(async (item) => {
        const rateDoc = await LaundryRate.findById(item.rateId);
        if (!rateDoc) throw new Error(`Rate not found for ID: ${item.rateId}`);
        return {
          ...item,
          calculatedAmount: rateDoc.rate * item.quantity,
        };
      })
    );

    laundryOrder.items.push(...newItems);
    laundryOrder.totalAmount += newItems.reduce((sum, i) => sum + i.calculatedAmount, 0);
    await laundryOrder.save();

    res.json(laundryOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Cancel Order
exports.cancelLaundryOrder = async (req, res) => {
  try {
    const order = await Laundry.findByIdAndUpdate(req.params.id, { isCancelled: true, laundryStatus: "cancelled" }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Mark Returned
exports.markLaundryReturned = async (req, res) => {
  try {
    const order = await Laundry.findByIdAndUpdate(req.params.id, { isReturned: true }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// — Report Damage/Loss
exports.reportDamageOrLoss = async (req, res) => {
  try {
    // Ab body se directly sab le rahe hain
    const { damageReported, damageNotes, isLost, lossNote } = req.body;

    const order = await Laundry.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Agar client ne explicitly damageReported bheja hai tab update karo
    if (typeof damageReported !== "undefined") {
      order.damageReported = damageReported;
    }

    if (damageNotes) {
      order.damageNotes = damageNotes;
    }

    // isLost default false hai, agar client ne value di to update karo
    if (typeof isLost !== "undefined") {
      order.isLost = isLost;
    }

    if (lossNote) {
      order.lossNote = lossNote;
    }

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
