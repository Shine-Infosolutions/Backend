const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "BEVERAGES", "SOUP_VEG", "SOUP_NON_VEG", "YEH_V_JARURI_HAI",
      "FISH_SNACKS", "CHICKEN_SNACKS", "MUTTON_STARTERS", 
      "DESI_CHEESE_KE_KHAZANE", "CHINESE_WOK_SE", "ITALIAN",
      "SALAD_BAR", "CURD_AND_RAITA", "MAIN_COURSE_GHAR_KA_SWAD",
      "VEGETABLES", "MAIN_COURSE_PANEER", "MAIN_COURSE_CHICKEN",
      "MAIN_COURSE_MUTTON", "MAIN_COURSE_FISH_WITH_BONE",
      "RICE", "INDIAN_BREADS", "DESSERTS", "ICE_CREAM", "ADDITIONAL"
    ]
  },
  foodType: {
    type: String,
    required: true,
    enum: ["Veg", "Non-Veg", "Both"]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("MenuItem", menuItemSchema);