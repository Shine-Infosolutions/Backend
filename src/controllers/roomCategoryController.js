const RoomCategory = require("../models/roomCategory");

exports.createRoomCategory = async (req, res) => {
  try {
    const { category, status, max_rooms } = req.body;
    const newCategory = new RoomCategory({ category, status, max_rooms });
    await newCategory.save();

    res.status(201).json({ success: true, roomCategory: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Categories with Search and Pagination
exports.getAllRoomCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.category = regex;
    }

    const categories = await RoomCategory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await RoomCategory.countDocuments(query);

    res.json({
      success: true,
      categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Room Categories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Update Category
exports.updateRoomCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.category !== undefined)
      updateData.category = req.body.category.trim();
    if (req.body.status !== undefined)
      updateData.status = req.body.status.trim();
    if (req.body.max_rooms !== undefined)
      updateData.max_rooms = req.body.max_rooms;
    const updated = await RoomCategory.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json({ success: true, roomCategory: updated });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Category
exports.deleteRoomCategory = async (req, res) => {
  try {
    await RoomCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
