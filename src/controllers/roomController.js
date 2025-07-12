// ✅ BOOK Room (decrement available count in category)
exports.bookRoom = async (req, res) => {
  try {
    const { category, count = 1, title, room_number, price, extra_bed, description } = req.body;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }
    const RoomCategory = require("../models/roomCategory");
    const cat = await RoomCategory.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: "Invalid category." });
    }
    // Create new rooms with provided details and mark as booked
    let createdRooms = [];
    let errors = [];
    const Room = require("../models/room");
    const currentRoomCount = await Room.countDocuments({ category });
    if (cat.max_rooms && currentRoomCount + Number(count) > cat.max_rooms) {
      return res.status(400).json({ success: false, message: `Cannot book ${count} rooms. Only ${cat.max_rooms - currentRoomCount} rooms can be created for this category.` });
    }
    for (let i = 0; i < count; i++) {
      try {
        // Room number is always sequential for the category
        const nextRoomNumber = currentRoomCount + i + 1;
        const newRoom = new Room({
          title: title ? `${title} ${nextRoomNumber}` : `Room ${nextRoomNumber}`,
          category,
          room_number: `${nextRoomNumber}`,
          price: price || cat.price || 0,
          extra_bed: extra_bed || false,
          is_oos: true, // Mark as booked
          status: true,
          description: description || `Auto-created and booked room in ${cat.category}`,
          photos: [],
        });
        await newRoom.save();
        createdRooms.push(newRoom);
      } catch (err) {
        errors.push(err.message);
      }
    }
    // Decrement max_rooms in category
    if (cat.max_rooms > 0) {
      cat.max_rooms = cat.max_rooms - createdRooms.length;
      if (cat.max_rooms < 0) cat.max_rooms = 0;
      await cat.save();
    }
    res.json({ success: true, message: `Created and booked ${createdRooms.length} room(s).`, rooms: createdRooms, rooms_left: cat.max_rooms, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const express = require("express");
const Room = require("../models/room");

// ✅ CREATE Room
exports.createRoom = async (req, res) => {
  try {
    const {
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_oos,
      status,
      description,
    } = req.body;

    const photos = req.files?.map(file => file.path) || [];

    // Enforce max_rooms limit
    const RoomCategory = require("../models/roomCategory");
    const cat = await RoomCategory.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: "Invalid category." });
    }
    const currentRoomCount = await Room.countDocuments({ category });
    if (cat.max_rooms && currentRoomCount >= cat.max_rooms) {
      return res.status(400).json({ success: false, message: `Maximum number of rooms (${cat.max_rooms}) for this category reached.` });
    }

    const newRoom = new Room({
      title,
      category,
      room_number,
      price,
      extra_bed,
      is_oos,
      status,
      description,
      photos,
    });

    await newRoom.save();
    res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ALL Rooms — with search, filters, pagination
exports.getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      status,
      is_oos,
      extra_bed,
    } = req.query;

    const query = {};

    // 🔍 Search by title or room_number
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { room_number: regex },
      ];
    }

    // ✅ Filters
    if (category) query.category = category;
    if (status !== undefined) query.status = status === "true";
    if (is_oos !== undefined) query.is_oos = is_oos === "true";
    if (extra_bed !== undefined) query.extra_bed = extra_bed === "true";

    const rooms = await Room.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      rooms,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET Room By ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("category");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE Room
exports.updateRoom = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files?.length > 0) {
      updates.photos = req.files.map(file => file.path);
    }

    // If unbooking (is_oos: false), increment max_rooms in category
    let updatedRoom = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (updates.is_oos === false || updates.is_oos === "false") {
      const RoomCategory = require("../models/roomCategory");
      if (updatedRoom && updatedRoom.category) {
        await RoomCategory.findByIdAndUpdate(updatedRoom.category, { $inc: { max_rooms: 1 } });
      }
    }
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE Room
exports.deleteRoom = async (req, res) => {
  try {
    // Find the room to get its category and booking status
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    // If the room was booked, increment max_rooms in category
    if (room.is_oos) {
      const RoomCategory = require("../models/roomCategory");
      await RoomCategory.findByIdAndUpdate(room.category, { $inc: { max_rooms: 1 } });
    }
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
