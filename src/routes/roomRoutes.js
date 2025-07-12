const express = require("express");
const roomController = require("../controllers/roomController.js");
const { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom } = roomController;

const router = express.Router();

router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/gett/:id", getRoomById);

router.put("/update/:id", updateRoom);

router.delete("/delete/:id", deleteRoom);

module.exports = router;
