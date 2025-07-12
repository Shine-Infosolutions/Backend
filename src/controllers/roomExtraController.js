const Room = require("../models/room");

// Get all rooms for a category
exports.getRoomsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) return res.status(400).json({ success: false, message: "Category ID required" });
    const rooms = await Room.find({ category: categoryId });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
