const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/laundryController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new laundry order (guest/house/staff)
router.post("/", authMiddleware(["admin", "staff"], ["reception", "laundry", "housekeeping"]), laundryController.createLaundryOrder);

// Get all laundry orders (can use query ?laundryStatus=...&itemType=...)
router.get("/", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.getAllLaundryOrders);

// Get laundry by unique laundry _id
router.get("/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.getLaundryById);

// Get all laundry by Booking ID (guest laundry)
router.get("/booking/:bookingId", authMiddleware(["admin", "staff"], ["reception", "laundry"]), laundryController.getLaundryByBookingId);

// Get laundry by Room ID
router.get("/room/:roomId", authMiddleware(["admin", "staff"], ["reception", "laundry"]),laundryController.getLaundryByRoom);

// Get all by GRC number (guest laundry)
router.get("/grc/:grcNo", authMiddleware(["admin", "staff"], ["reception", "laundry"]), laundryController.getLaundryByGRC);

// Update whole laundry order (status, meta, replacement, etc)
router.put("/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryOrder);

// Update status or damage info for a single item of order
router.patch("/item/:laundryId/:itemName", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryItemStatus);

// Mark as cancelled
router.patch("/cancel/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.cancelLaundryOrder);

// Mark as returned/completed delivery
router.patch("/return/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.markLaundryReturned);

// Report loss or damage (and possible compensation)
router.post("/loss/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.reportLaundryLossOrDamage);

// Update billing/payment/invoice details
router.patch("/bill/:id", authMiddleware(["admin", "staff"], ["laundry"]), laundryController.updateLaundryBilling);

// Permanently delete a laundry order
router.delete("/:id", authMiddleware(["admin"]), laundryController.deleteLaundry);

module.exports = router;
