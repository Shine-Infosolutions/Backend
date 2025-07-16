const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // 🔹 Core Booking Info
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    //required: true
  },
  roomNumber: {
    type: Number,
    //required: true
  },
  numberOfRooms: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  referenceNumber: {
    type: String,
    //required: true,
    unique: true
  },  
  createdAt: {
    type: Date,
    default: Date.now
  },

  // 🔹 Guest Details
  guestDetails: {
    name: String,
    age: Number,
    gender: String,
    isVIP: { type: Boolean, default: false },
    anniversary: Date,
    nationality: String,
    guestImage: String // Cloudinary URL or local path
  },

  // 🔹 Contact Info
  contactDetails: {
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pinCode: String
  },

  // 🔹 Identity Info
  identityDetails: {
    idType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other']
    },
    idNumber: String,
    idPhotoFront: String, // Cloudinary URL
    idPhotoBack: String
  },

  // 🔹 Booking Details
  bookingInfo: {
    checkIn: {
      type: Date,
      //required: true
    },
    checkOut: {
      type: Date,
      //required: true
    },
    arrivalFrom: String,
    bookingType: {
      type: String,
      enum: ['Online', 'Walk-in', 'Agent', 'Corporate', 'Other']
    },
    purposeOfVisit: String,
    remarks: String,
    adults: Number,
    children: Number
  },

  // 🔹 Payment Info
  paymentDetails: {
    totalAmount: Number,
    advancePaid: Number,
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
    },
    billingName: String,
    billingAddress: String,
    gstNumber: String
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
