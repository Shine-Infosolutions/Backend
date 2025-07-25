const mongoose = require("mongoose");

const laundrySchema = new mongoose.Schema({
  grcNo: String,

  // References
  roomNumber: String,

  // Department & requestor info
  requestedByDept: {
    type: String,
    enum: ["frontdesk", "housekeeping", "kitchen", "guest", "other"],
    default: "guest",
  },
  requestedByName: String,

  // Items array
  items: [
    {
      itemName: { type: String, required: true },
      quantity: { type: Number, default: 1, min: 0 },
      deliveredQuantity: { type: Number, default: 0, min: 0 }, // Partial/split delivery support
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
    },
  ],

  // Laundry order meta
  itemType: {
    type: String,
    enum: ["guest", "house", "uniform"],
    required: true,
  },
  isUrgent: { type: Boolean, default: false },
  urgencyNote: String,
  specialInstructions: String,

  // Job status and scheduling
  laundryStatus: {
    type: String,
    enum: [
      "pending",
      "in_progress",
      "partially_delivered",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  pickupTime: Date,
  deliveredTime: Date,
  scheduledPickupTime: Date,
  scheduledDeliveryTime: Date,
  pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receivedBy: String,

  // Damage/loss/lost-found flow
  damageReported: { type: Boolean, default: false },
  damageNotes: String,
  discardReason: String,
  returnDeadline: Date,
  lossNote: String,
  isLost: { type: Boolean, default: false },
  isFound: { type: Boolean, default: false },
  foundDate: Date,
  foundRemarks: String,
  lostDate: Date,
  // Billing and offers (incl. comp/discount)
  isBillable: { type: Boolean, default: false },
  isComplimentary: { type: Boolean, default: false },
  billStatus: {
    type: String,
    enum: ["not_applicable", "unpaid", "paid", "waived"],
    default: "not_applicable",
  },

  isReturned: { type: Boolean, default: false },
  isCancelled: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Laundry", laundrySchema);
