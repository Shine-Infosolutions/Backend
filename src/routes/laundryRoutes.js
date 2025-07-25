const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/laundryController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create new laundry order
router.post(
  "/",
  authMiddleware(["admin", "staff"], ["reception", "housekeeping", "laundry"]),
  laundryController.createLaundryOrder
);

// search pagination and filtering
router.get(
  "/search",
  authMiddleware(["admin", "staff"], ["laundry"]), 
  laundryController.getLaundryWithQuery
);

// ✅ Get all laundry orders with filters
router.get(
  "/",
  authMiddleware(["admin"], ["laundry"]),
  laundryController.getAllLaundryOrders
);

// ✅ Get laundry by ID
router.get(
  "/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getLaundryById
);

// ✅ Get laundry orders by Booking ID
router.get(
  "/booking/:bookingId",
  authMiddleware(["admin", "staff"], ["laundry", "reception"]),
  laundryController.getLaundryByBookingId
);

// ✅ Get laundry orders by Room ID
router.get(
  "/room/:roomId",
  authMiddleware(["admin", "staff"], ["laundry", "reception"]),
  laundryController.getLaundryByRoom
);

// ✅ Get laundry orders by GRC No
router.get(
  "/grc/:grcNo",
  authMiddleware(["admin", "staff"], ["laundry", "reception"]),
  laundryController.getLaundryByGRC
);

// ✅ Update entire laundry order by ID
router.put(
  "/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.updateLaundryOrder
);

// ✅ Update individual laundry item status/damage by laundryId and itemName
router.patch(
  "/item/:laundryId/:itemName",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.updateLaundryItemStatus
);

// ✅ Cancel laundry order by ID
router.patch(
  "/cancel/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.cancelLaundryOrder
);

// ✅ Mark laundry as returned by ID
router.patch(
  "/return/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.markLaundryReturned
);

// ✅ Report damage or loss on laundry order by ID
router.post(
  "/loss/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.reportLaundryLossOrDamage
);

// ✅ Update billing information by laundry order ID
router.patch(
  "/bill/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.updateLaundryBilling
);

// ✅ Transfer laundry order to another room by ID
router.patch(
  "/transfer/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.transferLaundryOrder
);

// ✅ Add items to existing laundry order
router.patch(
  "/add-items/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.addItemsToLaundryOrder
);


// ✅ Delete laundry order permanently by ID
router.delete(
  "/:id",
  authMiddleware(["admin"], ["laundry"]),
  laundryController.deleteLaundry
);

// ✅ Get pending or urgent laundry orders
router.get(
  "/status/pending-or-urgent",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getPendingOrUrgentLaundry
);

// ✅ Get laundry orders by batch code
router.get(
  "/batch/:batchCode",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getLaundryByBatchCode
);

// ✅ Bulk update status of multiple laundry items
router.patch(
  "/bulk-status",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.bulkUpdateLaundryStatus
);

module.exports = router;
