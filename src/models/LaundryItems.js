// models/laundryItem.schema.js
const mongoose = require("mongoose");

const laundryItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 0 },
  deliveredQuantity: { type: Number, default: 0, min: 0 },
  laundryServiceType: {
    type: String,
    enum: ["wash", "iron", "dry_clean", "wash+iron"],
  },
  status: {
    type: String,
    enum: [
      "pending",
      "picked_up",
      "washing",
      "ironing",
      "ready",
      "delivered",
    ],
    default: "pending",
  },
  damageReported: { type: Boolean, default: false },
  itemNotes: String,
}); 

module.exports = laundryItemSchema;
