const mongoose = require("mongoose");

const banquetbookingSchema = new mongoose.Schema({
  name: { type: String,  trim: true },
  email: { type: String,  trim: true },
  number: { type: String,  trim: true },
  whatsapp: { type: String,  trim: true },
  pax: { type: Number, },
  startDate: { type: Date, },
 gst:{type:Number},

  ratePlan: { type: String, },
  advance: { type: Number, default: 0 },
  total: { type: Number, },
  balance: { type: Number },
  ratePerPax: { type: Number }, // Rate per person
  paymentMethod: {
  type: String,
  enum: ["cash", "online"],
  default: "cash"
},
transactionId: {
  type: String,
  trim: true
},
  discount:{type:Number},
  hall:{
    type: String,
    enum: ["Nirvana", "Mandala", "Conference","Lawn"], 
    default: "Nirvana",
  },
  extraRooms: { type: Number, default: 0 },
roomPricePerUnit: { type: Number, default: 0 },
extraRoomTotalPrice: { type: Number, default: 0 }, // Total price for extra rooms
roomOption: { type: String, enum: ['complimentary', 'additional', 'both'], default: 'complimentary' },
complimentaryRooms: {
  type: Number,
  default: 2 // or whatever your default is
},

  time:{type: String, trim: true}, // Time of the bookin
foodType: {
  type: String,
  enum: ["Veg", "Non-Veg", "Both"], 
  default: "Veg",
},
functionType: {
type: String,
enum: ["Ring ceremony", "Wedding", "Tilak","Birthday","Anniversary","Mundan","Sangeet + Mehndi","Corporate meeting","Haldi function" ,"Farewell"],
default:"Wedding",
},
bookingStatus: {
  type: String,
  enum: ["Tentative", "Confirmed", "Enquiry"], 
  default: "Tentative",
},
  notes: { type: String, trim: true },

  customerRef: { type: String, unique: true },
  
staffEditCount: { type: Number, default: 0 }, // Count of staff edits to the booking
 
  status: { type: Boolean, default: true }, // Whether the booking is confirmed or not
  isConfirmed: { type: Boolean, default: false }, // Whether the booking is confirmed or not
  isTentative: { type: Boolean, default: true }, // Whether the booking is tentative or not
  isEnquiry: { type: Boolean, default: false }, // Whether the booking is an enquiry or not
 statusHistory:[{
status:String,
changedAt:Date
 }],
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("BanquetBooking", banquetbookingSchema);
