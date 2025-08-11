const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  grcNo: { type: String, unique: true, required: true },  // Guest Registration Card No
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  bookingDate: { type: Date, default: Date.now },
  numberOfRooms: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  days: { type: Number },
  timeIn: { type: String },
  timeOut: {
    type: String,
    default: '12:00',
    immutable: true 
  },  

  salutation: { type: String, enum: ['mr.', 'mrs.', 'ms.', 'dr.', 'other'], default: 'mr.' },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  city: { type: String },
  nationality: { type: String },
  mobileNo: { type: String, required: true },
  email: { type: String },
  phoneNo: { type: String },
  birthDate: { type: Date },
  anniversary: { type: Date },

  companyName: { type: String },
  companyGSTIN: { type: String },

  idProofType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Voter ID', 'Passport', 'Driving License', 'Other'],
    required: true
  },  idProofNumber: { type: String },
  idProofImageUrl: { type: String },
  idProofImageUrl2: { type: String },
  photoUrl: { type: String },

  roomNumber: { type: String },
  planPackage: { type: String }, //cp map/ mp
  noOfAdults: { type: Number },
  noOfChildren: { type: Number },
  rate: { type: Number },
  taxIncluded: { type: Boolean, default: false },
  serviceCharge: { type: Boolean, default: false },

  arrivedFrom: { type: String },
  destination: { type: String },
  remark: { type: String },
  businessSource: { type: String },
  marketSegment: { type: String },
  purposeOfVisit: { type: String },

  discountPercent: { type: Number, default: 0 },
  discountRoomSource: { type: Number, default: 0 },

  paymentMode: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Partial'],
    default: 'Pending'
  },

  bookingRefNo: { type: String },
  
  mgmtBlock: { type: String, enum: ['Yes', 'No'], default: 'No' },
  billingInstruction: { type: String },

  temperature: { type: Number },

  fromCSV: { type: Boolean, default: false },
  epabx: { type: Boolean, default: false },
  vip: { type: Boolean, default: false },

  status: { 
    type: String, 
    enum: ['Booked', 'Checked In', 'Checked Out', 'Cancelled'], 
    default: 'Booked' 
  },

  // 🔹 Extension History
  extensionHistory: [
    {
      originalCheckIn: { type: Date },
      originalCheckOut: { type: Date },
      extendedCheckOut: { type: Date },
      extendedOn: { type: Date, default: Date.now },
      reason: String,
      additionalAmount: Number,
      paymentMode: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
      },
      approvedBy: String
    }
  ],
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
