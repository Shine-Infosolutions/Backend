const mongoose = require("mongoose");

const planLimitSchema = new mongoose.Schema({
  ratePlan: {
    type: String,
    required: true,
    enum: ["Silver", "Gold", "Platinum"]
  },
  foodType: {
    type: String,
    required: true,
    enum: ["Veg", "Non-Veg"]
  },
  limits: {
    STARTERS_GROUP: { type: Number, default: 0 },
    BEVERAGES: { type: Number, default: 0 },
    SOUP_VEG: { type: Number, default: 0 },
    SOUP_NON_VEG: { type: Number, default: 0 },
    MAIN_COURSE_PANEER: { type: Number, default: 0 },
    MAIN_COURSE_CHICKEN: { type: Number, default: 0 },
    MAIN_COURSE_MUTTON: { type: Number, default: 0 },
    MAIN_COURSE_FISH_WITH_BONE: { type: Number, default: 0 },
    VEGETABLES: { type: Number, default: 0 },
    MAIN_COURSE_GHAR_KA_SWAD: { type: Number, default: 0 },
    RICE: { type: Number, default: 0 },
    INDIAN_BREADS: { type: Number, default: 0 },
    SALAD_BAR: { type: Number, default: 0 },
    CURD_AND_RAITA: { type: Number, default: 0 },
    DESSERTS: { type: Number, default: 0 },
    ICE_CREAM: { type: Number, default: 0 },
    WATER: { type: Number, default: 1 },
    LIVE_COUNTER: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Ensure unique combination of ratePlan and foodType
planLimitSchema.index({ ratePlan: 1, foodType: 1 }, { unique: true });

module.exports = mongoose.model("PlanLimit", planLimitSchema);