const mongoose = require("mongoose");

const laundrySchema = new mongoose.Schema({
  grcNo: String,

  // References
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  roomNumber: String,

  // For room transfer / guest move situations
  previousRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  previousRoomNumber: String,

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
      // beforeImage: String,
      // afterImage: String,
      damageReported: { type: Boolean, default: false },
      itemNotes: String,
      chargePerUnit: { type: Number, default: 0, min: 0 },
      totalCharge: { type: Number, default: 0, min: 0 },
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
  purpose: String,
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
  expectedDeliveryTime: Date,
  scheduledPickupTime: Date,
  scheduledDeliveryTime: Date,
  pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receivedBy: String,
  batchCode: String,

  // Damage/loss/lost-found flow
  damageReported: { type: Boolean, default: false },
  damageNotes: String,
  discardReason: String,
  returnDeadline: Date,
  compensationAmount: { type: Number, default: 0, min: 0 },
  lossNote: String,
  isLost: { type: Boolean, default: false },
  isFound: { type: Boolean, default: false },
  foundDate: Date,
  foundRemarks: String,
  refundRequested: { type: Boolean, default: false },
  photoProofUrl: String,
  approvalBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Billing and offers (incl. comp/discount)
  isBillable: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  isComplimentary: { type: Boolean, default: false },
  totalCharge: { type: Number, default: 0, min: 0 },
  finalCharge: { type: Number, default: 0, min: 0 },
  billStatus: {
    type: String,
    enum: ["not_applicable", "unpaid", "paid", "waived"],
    default: "not_applicable",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  // If want to track invoiceId later, uncomment below
  // invoiceId: { type: String },

  isReturned: { type: Boolean, default: true },
  isCancelled: { type: Boolean, default: false },

  // Metadata & operator fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  remarks: String,
}, { timestamps: true });

// Auto-calculate totals before save: supports discounts and complimentary
laundrySchema.pre("save", function (next) {
  if (Array.isArray(this.items)) {
    this.items.forEach((item) => {
      // Ensure chargePerUnit and quantity are numbers and >= 0
      const unitCharge = item.chargePerUnit || 0;
      const qty = item.quantity || 0;

      item.totalCharge = unitCharge * qty;
    });

    this.totalCharge = this.items.reduce(
      (sum, item) => sum + (item.totalCharge || 0),
      0
    );

    if (this.isComplimentary === true || this.discountPercent === 100) {
      this.finalCharge = 0;
    } else if (this.discountPercent) {
      this.finalCharge =
        this.totalCharge - (this.totalCharge * this.discountPercent) / 100;
    } else {
      this.finalCharge = this.totalCharge;
    }
  }
  next();
});

module.exports = mongoose.model("Laundry", laundrySchema);
