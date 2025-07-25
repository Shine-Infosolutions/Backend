const mongoose = require('mongoose');

const pantryOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  orderType: {
    type: String,
    required: true,
    enum: ['kitchen-to-pantry', 'pantry-to-reception']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    pantryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PantryItem',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: String,
    notes: String
  }],
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: Date,
  fulfilledDate: Date,
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Generate order number before saving
pantryOrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const prefix = this.orderType === 'kitchen-to-pantry' ? 'KP' : 'PR';
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `${prefix}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('PantryOrder', pantryOrderSchema);