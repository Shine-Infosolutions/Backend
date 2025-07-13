const Booking = require('../models/Booking');
const Category = require('../models/Category');

// Book a room for a category
exports.bookRoom = async (req, res) => {
  try {
    // Handle multiple bookings if 'bookings' array is present
    if (Array.isArray(req.body.bookings)) {
      const { bookings } = req.body;
      if (bookings.length === 0) {
        return res.status(400).json({ error: 'No bookings requested' });
      }
      const results = [];
      for (const bookingRequest of bookings) {
        const { categoryId, count } = bookingRequest;
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ error: `Category not found: ${categoryId}` });
        }
        const currentBookings = await Booking.countDocuments({ category: categoryId });
        if (currentBookings + count > category.maxRooms) {
          return res.status(400).json({ error: `Not enough rooms available in ${category.name}` });
        }
        // Determine starting room number
        let startRoomNumber = 1;
        if (category.name.toLowerCase() === 'deluxe') {
          startRoomNumber = 100;
        } else if (category.name.toLowerCase() === 'suite') {
          startRoomNumber = 200;
        }
        // Find the highest room number for this category
        const lastBooking = await Booking.find({ category: categoryId })
          .sort({ roomNumber: -1 })
          .limit(1);
        let nextRoomNumber = startRoomNumber;
        if (lastBooking.length > 0) {
          nextRoomNumber = lastBooking[0].roomNumber + 1;
        }
        const bookedRoomNumbers = [];
        for (let i = 0; i < count; i++) {
          const booking = new Booking({ category: categoryId, roomNumber: nextRoomNumber });
          await booking.save();
          bookedRoomNumbers.push(nextRoomNumber);
          nextRoomNumber++;
        }
        // Decrement maxRooms in Category
        category.maxRooms -= count;
        await category.save();
        results.push({ category: category.name, roomNumbers: bookedRoomNumbers });
      }
      return res.status(201).json({ success: true, booked: results });
    }

    // Handle single booking (with optional count)
    const { categoryId, count } = req.body;
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const numRooms = count && Number.isInteger(count) && count > 0 ? count : 1;
    const currentBookings = await Booking.countDocuments({ category: categoryId });
    if (currentBookings + numRooms > category.maxRooms) {
      return res.status(400).json({ error: 'Not enough rooms available for this category' });
    }
    // Assign room numbers
    let startRoomNumber = 1;
    if (category.name.toLowerCase() === 'deluxe') {
      startRoomNumber = 100;
    } else if (category.name.toLowerCase() === 'suite') {
      startRoomNumber = 200;
    }
    const lastBooking = await Booking.find({ category: categoryId })
      .sort({ roomNumber: -1 })
      .limit(1);
    let nextRoomNumber = startRoomNumber;
    if (lastBooking.length > 0) {
      nextRoomNumber = lastBooking[0].roomNumber + 1;
    }
    const bookedRoomNumbers = [];
    for (let i = 0; i < numRooms; i++) {
      const booking = new Booking({ category: categoryId, roomNumber: nextRoomNumber });
      await booking.save();
      bookedRoomNumbers.push(nextRoomNumber);
      nextRoomNumber++;
    }
    // Decrement maxRooms in Category
    category.maxRooms -= numRooms;
    await category.save();
    return res.status(201).json({ success: true, category: category.name, roomNumbers: bookedRoomNumbers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('category');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookings by category
exports.getBookingsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const bookings = await Booking.find({ category: categoryId }).populate('category');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Book multiple rooms for one or more categories
exports.bookManyRooms = async (req, res) => {
  try {
    const { bookings } = req.body; // [{ categoryId, count }]
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ error: 'No bookings requested' });
    }
    const results = [];
    for (const bookingRequest of bookings) {
      const { categoryId, count } = bookingRequest;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: `Category not found: ${categoryId}` });
      }
      const currentBookings = await Booking.countDocuments({ category: categoryId });
      if (currentBookings + count > category.maxRooms) {
        return res.status(400).json({ error: `Not enough rooms available in ${category.name}` });
      }
      // Determine starting room number
      let startRoomNumber = 1;
      if (category.name.toLowerCase() === 'deluxe') {
        startRoomNumber = 100;
      } else if (category.name.toLowerCase() === 'suite') {
        startRoomNumber = 200;
      } else if (category.name.toLowerCase() === 'standard') {
        startRoomNumber = 300;
    }

      // Find the highest room number for this category
      const lastBooking = await Booking.find({ category: categoryId })
        .sort({ roomNumber: -1 })
        .limit(1);
      let nextRoomNumber = startRoomNumber;
      if (lastBooking.length > 0) {
        nextRoomNumber = lastBooking[0].roomNumber + 1;
      }
      const bookedRoomNumbers = [];
      for (let i = 0; i < count; i++) {
        const booking = new Booking({ category: categoryId, roomNumber: nextRoomNumber });
        await booking.save();
        bookedRoomNumbers.push(nextRoomNumber);
        nextRoomNumber++;
      }
      // Decrement maxRooms in Category
      category.maxRooms -= count;
      await category.save();
      results.push({ category: category.name, roomNumbers: bookedRoomNumbers });
    }
    res.status(201).json({ success: true, booked: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete (unbook) a booking by ID
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const category = await Category.findById(booking.category);
    if (category) {
      category.maxRooms += 1;
      await category.save();
    }
    await booking.deleteOne();
    res.json({ success: true, message: 'Booking deleted (room unbooked)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 