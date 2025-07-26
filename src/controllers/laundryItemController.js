const LaundryItem = require("../models/LaundryItems");

// ✅ Add new laundry item
exports.createLaundryItem = async (req, res) => {
  try {
    const item = new LaundryItem(req.body);
    await item.save();
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Get all items
exports.getAllLaundryItems = async (req, res) => {
  try {
    const items = await LaundryItem.find({ isActive: true }).sort("itemName");
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get one item by ID
exports.getLaundryItemById = async (req, res) => {
  try {
    const item = await LaundryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update item
exports.updateLaundryItem = async (req, res) => {
  try {
    const updated = await LaundryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Delete (soft delete)
exports.deleteLaundryItem = async (req, res) => {
  try {
    const deleted = await LaundryItem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!deleted) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item soft-deleted", deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
