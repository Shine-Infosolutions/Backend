const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  // Beverages
  BEVERAGES: [{
    type: String,
    trim: true
  }],
  
  // Soups
  SOUP_VEG: [{
    type: String,
    trim: true
  }],
  SOUP_NON_VEG: [{
    type: String,
    trim: true
  }],
 
  


  YEH_V_JARURI_HAI: [{
    type: String,
    trim: true
  }],
  FISH_SNACKS: [{
    type: String,
    trim: true
  }],
  CHICKEN_SNACKS: [{
    type: String,
    trim: true
  }],
  DESI_CHEESE_KE_KHAZANE: [{
    type: String,
    trim: true
  }],
  CHINESE_WOK_SE: [{
    type: String,
    trim: true
  }],
  ITALIAN: [{
    type: String,
    trim: true
  }],
  MUTTON_STARTERS: [{
    type: String,
    trim: true
  }],
  
  // Salads and Raitas
  SALAD_BAR: [{
    type: String,
    trim: true
  }],
  CURD_AND_RAITA: [{
    type: String,
    trim: true
  }],
  
  // Main Courses
  MAIN_COURSE_GHAR_KA_SWAD: [{
    type: String,
    trim: true
  }],
  VEGETABLES: [{
    type: String,
    trim: true
  }],
  MAIN_COURSE_PANEER: [{
    type: String,
    trim: true
  }],
  MAIN_COURSE_CHICKEN: [{
    type: String,
    trim: true
  }],
  MAIN_COURSE_MUTTON: [{
    type: String,
    trim: true
  }],
  MAIN_COURSE_FISH_WITH_BONE: [{
    type: String,
    trim: true
  }],
  
  // Rice and Breads
  RICE: [{
    type: String,
    trim: true
  }],
  INDIAN_BREADS: [{
    type: String,
    trim: true
  }],
  
  // Desserts
  DESSERTS: [{
    type: String,
    trim: true
  }],
  ICE_CREAM: [{
    type: String,
    trim: true
  }],
  
  // Additional Items
  ADDITIONAL: [{
    type: String,
    trim: true
  }],
  
  // Reference to booking
  bookingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    unique: true
  },
  customerRef: { type: String, required: true, unique: true },
  
  //   count: {
  //   type: Number,
  //   default: 0
  // },

  // canCustomerEdit: {
  //   type: Boolean,
  //   default: true
  // }
}, {
  timestamps: true
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;