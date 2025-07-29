const express = require('express');
const router = express.Router();
const cabController = require('../controllers/cabBookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new cab booking (reception staff only)
router.post(
  '/bookings',
  cabController.createCabBooking
);

// Get all cab bookings
router.get(
  '/bookings',
  cabController.getAllCabBookings
);

// Update cab booking (any field like status or others)
router.put(
  '/bookings/:id',
  authMiddleware(['admin', 'staff'], ['reception']),
  cabController.updateCabBooking
);

// In routes/cabBookingRoutes.js
router.get("/driver/:driverId", cabController.getCabBookingsByDriver);

// Delete cab booking
router.delete(
  '/bookings/:id',
  authMiddleware(['admin']),
  cabController.deleteCabBooking
);

module.exports = router;