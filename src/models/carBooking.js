const mongoose = require('mongoose');

const cabBookingSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  pickupTime: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  cabType: {
    type: String,
    enum: ['standard', 'premium', 'suv'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialInstructions: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CabBooking', cabBookingSchema);
