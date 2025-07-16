const Room = require("../models/Room");
const Category = require("../models/Category");
const Booking = require("../models/Booking");

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const {
      title,
      category,
      room_number,
      price,
      exptra_bed,
      is_reserved,
      status,
      description,
      images,
    } = req.body;
    const room = new Room({
      title,
      category,
      room_number, // Ensure room_number is included
      price,
      exptra_bed,
      is_reserved,
      status,
      description,
      images,
    });
    await room.save();

    // Count rooms per category and get all room numbers for the created room's category
    const categories = await Room.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          roomNumbers: { $push: "$room_number" },
        },
      },
    ]);

    // Populate category names

    const populated = await Promise.all(
      categories.map(async (cat) => {
        const categoryDoc = await Category.findById(cat._id);
        return {
          category: categoryDoc?.name || "Unknown",
          count: cat.count,
          roomNumbers: cat.roomNumbers,
        };
      })
    );

    res.status(201).json({
      room,
      summary: populated,
      allocatedRoomNumber: room.room_number,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("category");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("category");
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a room
exports.updateRoom = async (req, res) => {
  try {
    const updates = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get rooms by category with booking status
exports.getRoomsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const rooms = await Room.find({ category: categoryId }).populate(
      "category"
    );
    const activeBookings = await Booking.find({
      category: categoryId,
      isActive: true,
    });
    const bookedRoomNumbers = new Set(
      activeBookings.map((booking) => booking.roomNumber)
    );

    const roomsWithStatus = rooms.map((room) => ({
      _id: room._id,
      title: room.title,
      room_number: room.room_number,
      price: room.price,
      status: room.status,
      category: room.category,
      isBooked: bookedRoomNumbers.has(parseInt(room.room_number)),
      canSelect:
        !bookedRoomNumbers.has(parseInt(room.room_number)) &&
        room.status === "available",
    }));

    res.json({ success: true, rooms: roomsWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
