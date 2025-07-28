const mongoose = require('mongoose');

const RestaurantOrderSchema = new mongoose.Schema({
  staffName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  tableNo: {
    type: String,
    required: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: { type: Number, required: true }
  }],
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  isMembership: {
    type: Boolean,
    default: false
  },
  isLoyalty: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.RestaurantOrder || mongoose.model('RestaurantOrder', RestaurantOrderSchema);