const Booking = require('../models/Booking');
const Category = require('../models/Category');

// Book a room for a category (single or multiple)
exports.bookRoom = async (req, res) => {
  try {
    const handleBooking = async (categoryId, count, extraDetails = {}) => {
      const category = await Category.findById(categoryId);
      if (!category) throw new Error(`Category not found: ${categoryId}`);

      const currentActiveCount = await Booking.countDocuments({ category: categoryId, isActive: true });
      if (currentActiveCount + count > category.maxRooms) {
        throw new Error(`Not enough rooms available in ${category.name}`);
      }

      const reusableRooms = await Booking.find({ category: categoryId, isActive: false })
        .sort({ roomNumber: 1 })
        .limit(count);

      const bookedRoomNumbers = [];

      // Reactivate old room numbers
      for (let i = 0; i < reusableRooms.length; i++) {
        const { roomNumber } = reusableRooms[i];
        const referenceNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

        const booking = new Booking({
          category: categoryId,
          roomNumber,
          isActive: true,
          numberOfRooms: 1,
          referenceNumber,
          guestDetails: extraDetails.guestDetails,
          contactDetails: extraDetails.contactDetails,
          identityDetails: extraDetails.identityDetails,
          bookingInfo: extraDetails.bookingInfo,
          paymentDetails: extraDetails.paymentDetails
        });

        await booking.save();
        bookedRoomNumbers.push(roomNumber);
      }

      const newRoomsToCreate = count - bookedRoomNumbers.length;

      let startRoomNumber = 1;
      const categoryName = category.name.toLowerCase();
      if (categoryName === 'deluxe') startRoomNumber = 100;
      else if (categoryName === 'suite') startRoomNumber = 200;
      else if (categoryName === 'standard') startRoomNumber = 300;

      const last = await Booking.find({ category: categoryId }).sort({ roomNumber: -1 }).limit(1);
      let nextRoomNumber = last.length ? last[0].roomNumber + 1 : startRoomNumber;

      for (let i = 0; i < newRoomsToCreate; i++) {
        const referenceNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

        const booking = new Booking({
          category: categoryId,
          roomNumber: nextRoomNumber,
          isActive: true,
          numberOfRooms: 1,
          referenceNumber,
          guestDetails: extraDetails.guestDetails,
          contactDetails: extraDetails.contactDetails,
          identityDetails: extraDetails.identityDetails,
          bookingInfo: extraDetails.bookingInfo,
          paymentDetails: extraDetails.paymentDetails
        });

        await booking.save();
        bookedRoomNumbers.push(nextRoomNumber++);
      }

      // Return all booked room records
      const bookings = await Booking.find({
        roomNumber: { $in: bookedRoomNumbers },
        category: categoryId
      });

      return bookings;
    };

    // 🔹 Handle multiple bookings
    if (Array.isArray(req.body.bookings)) {
      const results = [];

      for (const item of req.body.bookings) {
        const { categoryId, count, ...extraDetails } = item;
        const bookings = await handleBooking(categoryId, count, extraDetails);
        results.push(...bookings);
      }

      return res.status(201).json({ success: true, booked: results });
    }

    // 🔹 Handle single booking
    const {
      categoryId,
      count,
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails
    } = req.body;

    if (!categoryId) return res.status(400).json({ error: 'categoryId is required' });

    const numRooms = count && Number.isInteger(count) && count > 0 ? count : 1;

    const bookings = await handleBooking(categoryId, numRooms, {
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails
    });

    return res.status(201).json({ success: true, booked: bookings });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const bookings = await Booking.find(filter).populate('category');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get bookings by category
exports.getBookingsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const bookings = await Booking.find({ category: categoryId }).populate('category');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Unbook (soft delete)
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.isActive) {
      return res.status(400).json({ error: 'Booking already inactive' });
    }

    booking.isActive = false;
    await booking.save();

    res.json({ success: true, message: 'Booking unbooked (marked inactive)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 PERMANENT DELETE
exports.permanentlyDeleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const deleted = await Booking.findByIdAndDelete(bookingId);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, message: 'Booking permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
