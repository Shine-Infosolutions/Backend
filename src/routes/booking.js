const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Book a room or multiple rooms
router.post('/book', bookingController.bookRoom);

// Get all bookings
router.get('/all', bookingController.getBookings);

// Get bookings by category
router.get('/category/:categoryId', bookingController.getBookingsByCategory);

// Unbook (soft delete)
router.delete('/delete/:bookingId', bookingController.deleteBooking);

// Permanently delete booking (admin only)
router.delete('/permanent-delete/:bookingId', authMiddleware(['admin']), bookingController.permanentlyDeleteBooking);

module.exports = router;
