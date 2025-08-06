const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ['Booking', 'Reservation', 'CabBooking', 'Room', 'Housekeeping','RoomInspection'],
    required: true
  },
  serviceRefId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'serviceType'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true  
  },  
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      description: String,
      amount: Number
    }
  ],
  subTotal: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
  },
  status: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Partial'],
    default: 'Unpaid'
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
