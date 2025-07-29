const Laundry = require("../models/Laundry");

// ✅ Create Laundry Order
exports.createLaundryOrder = async (req, res) => {
  try {
    const laundry = new Laundry(req.body);
    await laundry.save();
    res.status(201).json({ success: true, laundry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Get All Laundry Orders (with optional `?urgent=true`)
exports.getAllLaundryOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.urgent === 'true') {
      filter.isUrgent = true;
    }
    const list = await Laundry.find(filter);
    res.json({ success: true, laundry: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Single Laundry by ID
exports.getLaundryById = async (req, res) => {
  try {
    const order = await Laundry.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, laundry: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Laundry by GRC number
exports.getLaundryByGRC = async (req, res) => {
  try {
    const orders = await Laundry.find({ grcNo: req.params.grcNo });
    res.json({ success: true, laundry: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Laundry by Room Number
exports.getLaundryByRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const orders = await Laundry.find({ roomNumber });
    res.json({ success: true, laundry: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update entire laundry order
exports.updateLaundryOrder = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Add new items to an existing laundry order
exports.addItemsToLaundryOrder = async (req, res) => {
  try {
    const { newItems } = req.body;
    if (!Array.isArray(newItems) || newItems.length === 0) {
      return res.status(400).json({ success: false, message: "newItems array required" });
    }

    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      { $push: { items: { $each: newItems } } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update status/notes of a single item
exports.updateLaundryItemStatus = async (req, res) => {
  try {
    const { laundryId, itemName } = req.params;
    const updates = req.body; // e.g. { status, deliveredQuantity, itemNotes, damageReported }

    const laundry = await Laundry.findById(laundryId);
    if (!laundry) return res.status(404).json({ success: false, message: "Order not found" });

    const item = laundry.items.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    Object.assign(item, updates);
    await laundry.save();

    res.json({ success: true, updatedItem: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Cancel Laundry Order
exports.cancelLaundryOrder = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      { isCancelled: true, laundryStatus: "cancelled", remarks: req.body.remarks },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Mark Laundry as Returned
exports.markLaundryReturned = async (req, res) => {
  try {
    const updates = {
      isReturned: true,
      deliveredTime: req.body.deliveredTime || new Date(),
      receivedBy: req.body.receivedBy
    };
    const updated = await Laundry.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Report Damage or Loss
exports.reportDamageOrLoss = async (req, res) => {
  try {
    const {
      damageNotes, discardReason, returnDeadline,
      lossNote, isLost, isFound, foundDate, foundRemarks
    } = req.body;

    const updates = {
      damageReported: true,
      damageNotes,
      discardReason,
      returnDeadline,
      lossNote,
      isLost,
      isFound,
      foundDate,
      foundRemarks
    };

    const updated = await Laundry.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Laundry Order
exports.deleteLaundry = async (req, res) => {
  try {
    const deleted = await Laundry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
