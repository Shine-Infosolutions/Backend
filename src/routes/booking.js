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

// get by grc number
router.get(
  "/grc/:grcNo",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.getBookingByGRC
);

// ✅ Get booking by ID (admin or staff from 'reception')
router.get(
  "/:bookingId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.getBookingById
);

// ✅ Unbook (soft delete) (admin or staff from 'reception')
router.delete(
  "/unbooks/:bookingId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.deleteBooking
);

// ✅ Permanently delete (admin only)
router.delete(
  "/delete/:bookingId",
  authMiddleware(["admin"]),
  bookingController.permanentlyDeleteBooking
);

// ✅ Update booking (admin or staff from 'reception')
router.put(
  "/update/:bookingId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.updateBooking
);

// ✅ Extend booking (admin or staff from 'reception')
router.post(
  "/extend/:bookingId",
  authMiddleware(["admin", "staff"], ["reception"]),
  bookingController.extendBooking
);

module.exports = router;
