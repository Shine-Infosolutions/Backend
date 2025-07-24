const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/laundryController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create new laundry order
router.post("/", authMiddleware(["admin", "staff"], ["reception", "housekeeping", "laundry"]), laundryController.createLaundryOrder);

// ✅ Get all laundry with filters
router.get("/", authMiddleware(["admin"], ["laundry"]), laundryController.getAllLaundryOrders);

// ✅ Get laundry by ID
router.get("/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.getLaundryById);

// ✅ Get by Booking ID
router.get("/booking/:bookingId", authMiddleware(["admin", "staff"], ["laundry", "reception"]), laundryController.getLaundryByBookingId);

// ✅ Get by Room ID
router.get("/room/:roomId", authMiddleware(["admin", "staff"], ["laundry", "reception"]), laundryController.getLaundryByRoom);

// ✅ Get by GRC No
router.get("/grc/:grcNo", authMiddleware(["admin", "staff"], ["laundry", "reception"]), laundryController.getLaundryByGRC);

// ✅ Update entire laundry record
router.put("/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryOrder);

// ✅ Update individual laundry item (status, damage etc.)
router.patch("/item/:laundryId/:itemName", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryItemStatus);

// ✅ Cancel order
router.patch("/cancel/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.cancelLaundryOrder);

// ✅ Mark returned
router.patch("/return/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.markLaundryReturned);

// ✅ Report damage or loss
router.post("/loss/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.reportLaundryLossOrDamage);

// ✅ Update billing information
router.patch("/bill/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryBilling);

// ✅ Transfer laundry request to another room
router.patch("/transfer/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.transferLaundryOrder);

// ✅ Delete permanently
router.delete("/:id", authMiddleware(["admin"]), laundryController.deleteLaundry);

// ✅ Get all pending/urgent laundry orders
router.get("/status/pending-or-urgent", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.getPendingOrUrgentLaundry);

// ✅ Get laundry orders by batchCode
router.get("/batch/:batchCode", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.getLaundryByBatchCode);

// ✅ Bulk update status of multiple laundry items
router.patch("/bulk-status", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.bulkUpdateLaundryStatus);

module.exports = router;
