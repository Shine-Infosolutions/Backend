const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  maxRooms: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Category', categorySchema); 