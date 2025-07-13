const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Book a room or multiple rooms
router.post('/book', bookingController.bookRoom);

// Get all bookings
router.get('/all', bookingController.getBookings);

// Get bookings by category
router.get('/category/:categoryId', bookingController.getBookingsByCategory);

// Unbook (delete) a booking
router.delete('/delete/:bookingId', bookingController.deleteBooking);

module.exports = router; 