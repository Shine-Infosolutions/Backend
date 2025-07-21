const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
  grcNo: String,

  // 🔗 References
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  roomNumber: { type: String }, // For easier lookup

  // 🔘 Department Request Info
  requestedByDept: {
    type: String,
    enum: ['frontdesk', 'housekeeping', 'kitchen', 'guest', 'other'],
    default: 'guest'
  },
  requestedByName: String,

  // 🧼 Items Array (Defined INLINE here)
  items: [{
    itemName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    laundryServiceType: {
      type: String,
      enum: ['wash', 'iron', 'dry_clean', 'wash+iron']
    },
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'washing', 'ironing', 'ready', 'delivered'],
      default: 'pending'
    },
    damageReported: { type: Boolean, default: false },
    chargePerUnit: Number,
    totalCharge: Number
  }],

  // 🧺 Laundry Job Details
  itemType: {
    type: String,
    enum: ['guest', 'house', 'uniform'],
    required: true
  },
  isUrgent: { type: Boolean, default: false },
  urgencyNote: String,
  purpose: String,

  // 📌 Status Tracking
  laundryStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: Date,
  deliveredTime: Date,
  expectedDeliveryTime: Date,
  pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivedBy: { type: String },
  batchCode: { type: String },

  // 🖼️ Before/After Images
  beforeLaundryImage: String,
  afterLaundryImage: String,

  // 🚨 Damage / Loss
  damageReported: { type: Boolean, default: false },
  damageNotes: String,
  discardReason: String,
  returnDeadline: Date,
  compensationAmount: Number,
  lossNote: String,
  refundRequested: { type: Boolean, default: false },
  photoProofUrl: String,
  approvalBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specialInstructions: String,

  // 💳 Billing
  isBillable: { type: Boolean, default: false },
  totalCharge: { type: Number, default: 0 },
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
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  isReturned: { type: Boolean, default: true },
  isCancelled: { type: Boolean, default: false },

  // 📌 Misc
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String

}, { timestamps: true });


// 🔄 Auto-calculate totalCharge based on items[]
laundrySchema.pre('save', function (next) {
  if (this.items && Array.isArray(this.items)) {
    this.items.forEach(item => {
      if (item.chargePerUnit && item.quantity) {
        item.totalCharge = item.chargePerUnit * item.quantity;
      } else {
        item.totalCharge = 0;
      }
    });

    this.totalCharge = this.items.reduce((sum, item) => sum + (item.totalCharge || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Laundry', laundrySchema);
