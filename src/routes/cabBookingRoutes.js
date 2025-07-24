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

// Update cab booking (any field like status or others)
router.put(
  '/bookings/:id',
  authMiddleware(['admin', 'staff'], ['reception']),
  cabController.updateCabBooking
);

// Delete cab booking
router.delete(
  '/bookings/:id',
  authMiddleware(['admin']),
  cabController.deleteCabBooking
);

module.exports = router;