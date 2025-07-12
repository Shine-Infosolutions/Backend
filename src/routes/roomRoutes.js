const express = require("express");
const roomController = require("../controllers/roomController.js");
const { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, bookRoom } = roomController;
const { getRoomsByCategory } = require("../controllers/roomExtraController.js");

const router = express.Router();


router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/gett/:id", getRoomById);
router.put("/update/:id", updateRoom);
router.delete("/delete/:id", deleteRoom);

// Book a room in a category
router.post("/book", bookRoom);

// Fetch rooms by category
router.get("/by-category/:categoryId", getRoomsByCategory);

module.exports = router;
