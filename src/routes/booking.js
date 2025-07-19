const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Book a room (admin or staff from 'reception')
router.post(
  "/book",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.bookRoom
);

// ✅ Get all bookings (admin or staff from 'reception')
router.get(
  "/all",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.getBookings
);

// ✅ Get bookings by category (admin or staff from 'reception')
router.get(
  "/category/:categoryId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.getBookingsByCategory
);

// ✅ Unbook (soft delete) (admin or staff from 'reception')
router.delete(
  "/delete/:bookingId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.deleteBooking
);

// ✅ Permanently delete (admin only)
router.delete(
  "/permanent-delete/:bookingId",
  authMiddleware(["admin"]),
  bookingController.permanentlyDeleteBooking
);

module.exports = router;
