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
        .populate("bookingId roomId previousRoomId categoryId pickupBy deliveredBy createdBy approvalBy");
      res.json({ success: true, laundry });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };  

// ✅ Get Laundry by ID
exports.getLaundryById = async (req, res) => {
    try {
      const laundry = await Laundry.findById(req.params.id)
        .populate("bookingId roomId previousRoomId categoryId pickupBy deliveredBy createdBy approvalBy");
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
  
  exports.getLaundryByRoom = async (req, res) => {
    try {
      const laundry = await Laundry.find({ roomId: req.params.roomId });
      res.json({ success: true, laundry });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
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
      const { status, deliveredQuantity, beforeImage, afterImage, damageReported, itemNotes } = req.body;
  
      const laundry = await Laundry.findById(laundryId);
      if (!laundry) return res.status(404).json({ error: "Laundry not found" });
  
      const item = laundry.items.find(i => i.itemName.toLowerCase() === itemName.toLowerCase());
      if (!item) return res.status(404).json({ error: `Item '${itemName}' not found` });
  
      if (status) item.status = status;
      if (typeof deliveredQuantity !== "undefined") item.deliveredQuantity = deliveredQuantity;
      if (beforeImage) item.beforeImage = beforeImage;
      if (afterImage) item.afterImage = afterImage;
      if (typeof damageReported !== "undefined") item.damageReported = damageReported;
      if (itemNotes) item.itemNotes = itemNotes;
  
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
      const {
        lossNote, photoProofUrl, compensationAmount,
        refundRequested, approvalBy, isLost, isFound, foundDate, foundRemarks
      } = req.body;
  
      const updates = {
        damageReported: true,
        lossNote,
        photoProofUrl,
        compensationAmount,
        refundRequested,
        approvalBy,
      };
      if (typeof isLost !== "undefined") updates.isLost = isLost;
      if (typeof isFound !== "undefined") updates.isFound = isFound;
      if (foundDate) updates.foundDate = foundDate;
      if (foundRemarks) updates.foundRemarks = foundRemarks;
  
      const updated = await Laundry.findByIdAndUpdate(req.params.id, updates, { new: true });
      res.json({ success: true, message: "Damage/loss/lost-found updated", laundry: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };  

// ✅ Update Billing (mark paid/unpaid + link to invoice)
exports.updateLaundryBilling = async (req, res) => {
    try {
      const {
        billStatus,
        paymentStatus,
        isComplimentary,
        discountPercent,
        invoiceId,
      } = req.body;
      const updates = {
        billStatus,
        paymentStatus,
      };
      if (typeof isComplimentary !== "undefined") updates.isComplimentary = isComplimentary;
      if (typeof discountPercent !== "undefined") updates.discountPercent = discountPercent;
      if (invoiceId) updates.invoiceId = invoiceId;
  
      const updated = await Laundry.findByIdAndUpdate(req.params.id, updates, { new: true });
      res.json({ success: true, message: "Billing/discount updated", laundry: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };  

  //transer laundry order to another room
  exports.transferLaundryOrder = async (req, res) => {
    try {
      const { newRoomId, newRoomNumber } = req.body;
      const laundry = await Laundry.findById(req.params.id);
      if (!laundry) return res.status(404).json({ error: "Laundry not found" });
      laundry.previousRoomId = laundry.roomId;
      laundry.previousRoomNumber = laundry.roomNumber;
      laundry.roomId = newRoomId;
      laundry.roomNumber = newRoomNumber;
      await laundry.save();
      res.json({ success: true, message: "Laundry order transferred", laundry });
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
