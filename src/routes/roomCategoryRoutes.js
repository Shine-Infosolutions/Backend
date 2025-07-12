const express = require("express");
const RoomCategory = require("../models/roomCategory");
const roomCategoryController = require("../controllers/roomCategoryController.js");
const {
  createRoomCategory,
  getAllRoomCategories,
  updateRoomCategory,
  deleteRoomCategory
} = roomCategoryController;

const router = express.Router();
router.post("/create", createRoomCategory);
router.get("/all", getAllRoomCategories);
router.put("/update/:id", updateRoomCategory);
router.delete("/delete/:id", deleteRoomCategory);

module.exports = router;
