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

// ✅ Get All Laundry Orders
exports.getAllLaundryOrders = async (req, res) => {
  try {
    const laundry = await Laundry.find()
      .populate("bookingId roomId previousRoomId pickupBy deliveredBy createdBy approvalBy");

    res.status(200).json({
      success: true,
      laundry,
    });
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

// ✅ Get Laundry by Booking ID
exports.getLaundryByBookingId = async (req, res) => {
  try {
    const laundry = await Laundry.find({ bookingId: req.params.bookingId });
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry by Room (roomId or roomNumber)
exports.getLaundryByRoom = async (req, res) => {
  try {
    const { roomId, roomNumber } = req.query;

    if (!roomId && !roomNumber) {
      return res.status(400).json({ success: false, message: "roomId or roomNumber is required" });
    }

    const query = roomId ? { roomId } : { roomNumber };
    const laundry = await Laundry.find(query)
      .populate("bookingId")
      .populate("roomId")
      .populate("categoryId");

    res.json({ success: true, laundry });
  } catch (error) {
    console.error("Error getting laundry by room:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Laundry by GRC No
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
    // if (beforeImage) item.beforeImage = beforeImage;
    // if (afterImage) item.afterImage = afterImage;
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
        remarks: req.body.remarks || "Cancelled by staff",
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
        remarks: req.body.remarks,
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

// ✅ Update Billing (mark paid/unpaid + discounts)
exports.updateLaundryBilling = async (req, res) => {
  try {
    const {
      billStatus,
      paymentStatus,
      isComplimentary,
      discountPercent,
     // invoiceId,  // You may uncomment in schema if used
    } = req.body;
    const updates = {
      billStatus,
      paymentStatus,
    };
    if (typeof isComplimentary !== "undefined") updates.isComplimentary = isComplimentary;
    if (typeof discountPercent !== "undefined") updates.discountPercent = discountPercent;
    //if (invoiceId) updates.invoiceId = invoiceId;

    const updated = await Laundry.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Billing/discount updated", laundry: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Transfer Laundry Order to another room
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

// ✅ Get Pending or Urgent Laundry
exports.getPendingOrUrgentLaundry = async (req, res) => {
  try {
    const filter = {
      $or: [
        { laundryStatus: "pending" },
        { isUrgent: true }
      ],
      isCancelled: false,
    };
    const laundry = await Laundry.find(filter);
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry by Batch Code
exports.getLaundryByBatchCode = async (req, res) => {
  try {
    const batchCode = req.params.batchCode;
    const laundry = await Laundry.find({ batchCode });
    res.json({ success: true, laundry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Bulk Update Laundry Item Status
exports.bulkUpdateLaundryStatus = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "No updates provided" });
    }

    const bulkOperations = updates.map(item => {
      const { laundryId, itemName, newStatus } = item;

      return {
        updateOne: {
          filter: { _id: laundryId, "items.itemName": itemName },
          update: { $set: { "items.$.status": newStatus } },
        }
      };
    });

    await Laundry.bulkWrite(bulkOperations);

    res.status(200).json({ success: true, message: "Statuses updated successfully" });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ success: false, message: "Bulk update failed", error });
  }
};

// ✅ Add new items to existing laundry order
exports.addItemsToLaundryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { newItems } = req.body; // newItems: [{ itemName, quantity, laundryServiceType, ... }]

    if (!Array.isArray(newItems) || newItems.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const updated = await Laundry.findByIdAndUpdate(
      id,
      { $push: { items: { $each: newItems } } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Laundry order not found" });
    }

    res.json({ success: true, message: "Items added", laundry: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Laundry Orders with Search, Filter, Pagination, Sorting
exports.getLaundryWithQuery = async (req, res) => {
  try {
    // Extract query params
    const {
      search,            // text search on fields like grcNo, requestedByName, remarks etc
      roomId,
      roomNumber,
      bookingId,
      laundryStatus,
      isUrgent,
      isCancelled,
      page = 1,          // default page 1
      limit = 10,        // default 10 items per page
      sortBy = "createdAt", // default sort field
      sortOrder = "desc"   // asc or desc
    } = req.query;

    // Build MongoDB filter object
    const filter = {};

    if (search) {
      // Example: do case-insensitive partial match on grcNo, requestedByName, remarks
      filter.$or = [
        { grcNo: { $regex: search, $options: "i" } },
        { requestedByName: { $regex: search, $options: "i" } },
        { remarks: { $regex: search, $options: "i" } }
      ];
    }

    if (roomId) filter.roomId = roomId;
    if (roomNumber) filter.roomNumber = roomNumber;
    if (bookingId) filter.bookingId = bookingId;
    if (laundryStatus) filter.laundryStatus = laundryStatus;
    if (typeof isUrgent !== "undefined") filter.isUrgent = isUrgent === "true";
    if (typeof isCancelled !== "undefined") filter.isCancelled = isCancelled === "true";

    // Pagination calculation
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting object
    const sortOrderNum = sortOrder === "asc" ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortOrderNum;

    // Query with filter, pagination, sorting, and population
    const laundry = await Laundry.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate("bookingId roomId previousRoomId pickupBy deliveredBy createdBy approvalBy");

    // Total count for pagination frontend
    const totalCount = await Laundry.countDocuments(filter);

    res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      laundry,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
