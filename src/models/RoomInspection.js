const mongoose = require('mongoose');

const RoomInspectionSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectionType: {
    type: String,
    enum: ['minibar', 'floor-checklist'],
    required: true
  },
  checklist: [
    {
      item: {
        type: String,
        required: true
      },
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem' 
      },
      status: {
        type: String,
        enum: ['ok', 'missing', 'damaged', 'refill-needed'],
        default: 'ok'
      },
      quantity: {
        type: Number,
        default: 1
      },
      remarks: {
        type: String
      }
    }
  ],
  totalCharges: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.RoomInspection || mongoose.model('RoomInspection', RoomInspectionSchema);
