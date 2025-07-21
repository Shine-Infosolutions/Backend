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

// ✅ Get All Laundry Orders (optional filters)
exports.getAllLaundryOrders = async (req, res) => {
  try {
    const filter = { ...req.query };
    const laundry = await Laundry.find(filter)
      .populate("bookingId roomId categoryId pickupBy deliveredBy createdBy approvalBy invoiceId");

    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Laundry by ID
exports.getLaundryById = async (req, res) => {
  try {
    const laundry = await Laundry.findById(req.params.id)
      .populate("bookingId roomId categoryId pickupBy deliveredBy createdBy approvalBy invoiceId");

    if (!laundry) return res.status(404).json({ error: "Laundry not found" });

    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry by Booking
exports.getLaundryByBookingId = async (req, res) => {
  try {
    const laundry = await Laundry.find({ bookingId: req.params.bookingId });
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry by Room
exports.getLaundryByRoom = async (req, res) => {
  try {
    const laundry = await Laundry.find({ roomId: req.params.roomId });
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry by GRC
exports.getLaundryByGRC = async (req, res) => {
  try {
    const laundry = await Laundry.find({ grcNo: req.params.grcNo });
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Laundry Order
exports.updateLaundryOrder = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Laundry order not found" });

    res.json({ success: true, laundry: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Update Single Laundry Item (by name)
exports.updateLaundryItemStatus = async (req, res) => {
  try {
    const { laundryId, itemName } = req.params;
    const { status, damageReported, damageNotes } = req.body;

    const laundry = await Laundry.findById(laundryId);
    if (!laundry) return res.status(404).json({ error: "Laundry not found" });

    const item = laundry.items.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
    if (!item) return res.status(404).json({ error: `Item '${itemName}' not found` });

    if (status) item.status = status;
    if (typeof damageReported !== "undefined") item.damageReported = damageReported;
    if (damageNotes) item.damageNotes = damageNotes;

    await laundry.save();
    res.json({ success: true, updatedItem: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel Laundry Order
exports.cancelLaundryOrder = async (req, res) => {
  try {
    const laundry = await Laundry.findByIdAndUpdate(
      req.params.id,
      {
        isCancelled: true,
        laundryStatus: "cancelled",
        remarks: req.body.remarks || "Cancelled by staff"
      },
      { new: true }
    );

    if (!laundry) return res.status(404).json({ error: "Laundry not found" });

    res.json({ success: true, message: "Laundry cancelled", laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark Laundry Returned
exports.markLaundryReturned = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      {
        isReturned: true,
        deliveredTime: req.body.deliveredTime || new Date(),
        receivedBy: req.body.receivedBy,
        remarks: req.body.remarks
      },
      { new: true }
    );

    res.json({ success: true, message: "Marked as returned", laundry: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Report Damage or Loss
exports.reportLaundryLossOrDamage = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      {
        damageReported: true,
        lossNote: req.body.lossNote,
        photoProofUrl: req.body.photoProofUrl,
        compensationAmount: req.body.compensationAmount,
        refundRequested: req.body.refundRequested,
        approvalBy: req.body.approvalBy
      },
      { new: true }
    );

    res.json({ success: true, message: "Damage or loss recorded", laundry: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Billing (mark paid/unpaid + link to invoice)
exports.updateLaundryBilling = async (req, res) => {
  try {
    const updated = await Laundry.findByIdAndUpdate(
      req.params.id,
      {
        billStatus: req.body.billStatus,
        paymentStatus: req.body.paymentStatus,
        invoiceId: req.body.invoiceId
      },
      { new: true }
    );

    res.json({ success: true, message: "Billing updated", laundry: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Laundry Record (PERMANENT)
exports.deleteLaundry = async (req, res) => {
  try {
    const deleted = await Laundry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Laundry not found" });

    res.json({ success: true, message: "Laundry record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
