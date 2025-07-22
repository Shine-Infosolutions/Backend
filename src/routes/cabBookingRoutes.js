const express = require('express');
const router = express.Router();
const cabController = require('../controllers/cabBookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new cab booking (reception staff only)
router.post(
  '/bookings',
  authMiddleware(['admin', 'staff'], ['reception']),
  cabController.createCabBooking
);

// Get all cab bookings
router.get(
  '/bookings',
  authMiddleware(['admin', 'staff'], ['reception']),
  cabController.getAllCabBookings
);

// Update cab booking status
router.put(
  '/bookings/:bookingId/status',
  authMiddleware(['admin', 'staff'], ['reception']),
  cabController.updateCabBookingStatus
);

// Delete cab booking
router.delete(
  '/bookings/:bookingId',
  authMiddleware(['admin']),
  cabController.deleteCabBooking
);

module.exports = router;
