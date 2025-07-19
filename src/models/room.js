const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  room_number: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  extra_bed: {
    type: Boolean,
    default: false
  },
  is_reserved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String
  },
  images: [{
    type: String
  }]
}, { timestamps: true });

// Use a more reliable way to export the model
let Room;
try {
  Room = mongoose.model('Room');
} catch (error) {
  Room = mongoose.model('Room', RoomSchema);
}

module.exports = mongoose.model('Room', RoomSchema);