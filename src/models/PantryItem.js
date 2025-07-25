const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'beverage', 'spices', 'dairy', 'frozen', 'dry-goods', 'other']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'liter', 'piece', 'pack', 'bottle', 'box', 'bag']
  },
  minThreshold: {
    type: Number,
    required: true,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    default: 'Main Pantry'
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  autoReorder: {
    type: Boolean,
    default: false
  },
  supplier: {
    name: String,
    contactPerson: String,
    phone: String,
    email: String
  },
  notes: String
}, {
  timestamps: true
});

// Update isLowStock before saving
pantryItemSchema.pre('save', function(next) {
  this.isLowStock = this.currentStock <= this.minThreshold;
  next();
});

module.exports = mongoose.model('PantryItem', pantryItemSchema);