const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
      required: true,
    },
    room_number: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    extra_bed: { type: Boolean, default: false },
    is_oos: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    description: { type: String },
    photos: [{ type: String }],
    room_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
