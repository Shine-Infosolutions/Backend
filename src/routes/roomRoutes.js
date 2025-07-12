const express = require("express");
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/gett/:id", getRoomById);

router.put("/update/:id", updateRoom);

router.delete("/delete/:id", deleteRoom);

export default router;
