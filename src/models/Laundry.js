const mongoose = require("mongoose");

const laundrySchema = new mongoose.Schema({
  grcNo: String,

  // References
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  roomNumber: String,

  // For room transfer / guest move situations
  previousRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  previousRoomNumber: String,

  // Department & requestor info
  requestedByDept: {
    type: String,
    enum: ['frontdesk', 'housekeeping', 'kitchen', 'guest', 'other'],
    default: 'guest'
  },
  requestedByName: String,

  // Items array (expanded for new fields)
  items: [{
    itemName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    deliveredQuantity: { type: Number, default: 0 },           // Partial/split delivery support
    laundryServiceType: {
      type: String,
      enum: ['wash', 'iron', 'dry_clean', 'wash+iron']
    },
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'washing', 'ironing', 'ready', 'delivered'],
      default: 'pending'
    },
    beforeImage: String,       // Per item before-laundry image/url
    afterImage: String,        // Per item after-laundry image/url
    damageReported: { type: Boolean, default: false },
    itemNotes: String,         // Per item remarks (damage, guest comments)
    chargePerUnit: Number,
    totalCharge: Number
  }],

  // Laundry order meta
  itemType: {
    type: String,
    enum: ['guest', 'house', 'uniform'],
    required: true
  },
  isUrgent: { type: Boolean, default: false },
  urgencyNote: String,
  purpose: String,
  specialInstructions: String,

  // Job status and scheduling
  laundryStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'partially_delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: Date,
  deliveredTime: Date,
  expectedDeliveryTime: Date,
  scheduledPickupTime: Date,         // New: Pre-booked pickup
  scheduledDeliveryTime: Date,       // New: Pre-booked delivery
  pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivedBy: String,
  batchCode: String,

  // Order-level images for full-batch documentation
  beforeLaundryImage: String,
  afterLaundryImage: String,

  // Damage/loss/lost-found flow
  damageReported: { type: Boolean, default: false },
  damageNotes: String,
  discardReason: String,
  returnDeadline: Date,
  compensationAmount: Number,
  lossNote: String,
  isLost: { type: Boolean, default: false },           // Item/order marked lost
  isFound: { type: Boolean, default: false },          // Marked found after lost
  foundDate: Date,
  foundRemarks: String,
  refundRequested: { type: Boolean, default: false },
  photoProofUrl: String,
  approvalBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Billing and offers (incl. comp/discount)
  isBillable: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0 },           // For partial/free offers
  isComplimentary: { type: Boolean, default: false },      // Mark job as 100% free
  totalCharge: { type: Number, default: 0 },
  finalCharge: { type: Number, default: 0 },               // Post-discount/comp value
  billStatus: {
    type: String,
    enum: ['not_applicable', 'unpaid', 'paid', 'waived'],
    default: 'not_applicable'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  invoiceId: { type: String },
  isReturned: { type: Boolean, default: true },
  isCancelled: { type: Boolean, default: false },

  // Metadata & operator fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String

}, { timestamps: true });

// Auto-calculate totals before save: supports discounts and complimentary
laundrySchema.pre('save', function (next) {
  if (Array.isArray(this.items)) {
    this.items.forEach(item => {
      if (item.chargePerUnit && item.quantity) {
        item.totalCharge = item.chargePerUnit * item.quantity;
      } else {
        item.totalCharge = 0;
      }
    });
    this.totalCharge = this.items.reduce((sum, item) => sum + (item.totalCharge || 0), 0);

    // Apply discount/complimentary values
    if (this.isComplimentary === true || this.discountPercent === 100) {
      this.finalCharge = 0;
    } else if (this.discountPercent) {
      this.finalCharge = this.totalCharge - (this.totalCharge * this.discountPercent / 100);
    } else {
      this.finalCharge = this.totalCharge;
    }
  }
  next();
});

module.exports = mongoose.model("Laundry", laundrySchema);
