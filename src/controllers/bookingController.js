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

      // Reuse inactive rooms first
      const reusableRooms = await Booking.find({ category: categoryId, isActive: false }).sort({ roomNumber: 1 }).limit(count);

      const bookedRoomNumbers = [];

      // Reactivate rooms
      // Reuse roomNumber but create new documents (do NOT overwrite old bookings)
for (let i = 0; i < reusableRooms.length; i++) {
  const { roomNumber } = reusableRooms[i];
  const referenceNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

  const booking = new Booking({
    category: categoryId,
    roomNumber,
    isActive: true,
    numberOfRooms: 1,
    referenceNumber,
    ...extraDetails
  });

  await booking.save();
  bookedRoomNumbers.push(roomNumber);
}


      // Calculate how many new rooms still needed
      const newRoomsToCreate = count - bookedRoomNumbers.length;

      // Determine startRoomNumber
      let startRoomNumber = 1;
      const categoryName = category.name.toLowerCase();
      if (categoryName === 'deluxe') startRoomNumber = 100;
      else if (categoryName === 'suite') startRoomNumber = 200;
      else if (categoryName === 'standard') startRoomNumber = 300;

      // Find the last assigned room number in this category (even inactive ones)
      const last = await Booking.find({ category: categoryId }).sort({ roomNumber: -1 }).limit(1);
      let nextRoomNumber = last.length ? last[0].roomNumber + 1 : startRoomNumber;
      
      for (let i = 0; i < newRoomsToCreate; i++) {
        const referenceNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`; // Total 6-digit number
      
        const booking = new Booking({
          category: categoryId,
          roomNumber: nextRoomNumber,
          isActive: true,
          numberOfRooms: 1,
          referenceNumber,
          guestDetails: req.body.guestDetails,
          contactDetails: req.body.contactDetails,
          identityDetails: req.body.identityDetails,
          bookingInfo: req.body.bookingInfo,
          paymentDetails: req.body.paymentDetails
        });
      
        await booking.save();
        bookedRoomNumbers.push(nextRoomNumber++);
      }
      
      return { category: category.name, roomNumbers: bookedRoomNumbers };
    };

    // Multiple bookings
    if (Array.isArray(req.body.bookings)) {
      const results = [];
      for (const item of req.body.bookings) {
        const { categoryId, count, ...extraDetails } = item;
        const result = await handleBooking(categoryId, count, extraDetails);
        results.push(result);
      }
      return res.status(201).json({ success: true, booked: results });
    }

    // Single booking
    const {
      categoryId,
      count,
      checkIn,
      checkOut,
      bookingType,
      purpose,
      remarks,
      paymentMode,
      advanceAmount,
      roomCount,
      adults,
      children,
      guestDetails,
      contactDetails,
      identityDetails,
      billingDetails
    } = req.body;

    if (!categoryId) return res.status(400).json({ error: 'categoryId is required' });

    const numRooms = count && Number.isInteger(count) && count > 0 ? count : 1;

    const result = await handleBooking(categoryId, numRooms, {
      checkIn,
      checkOut,
      bookingType,
      purpose,
      remarks,
      paymentMode,
      advanceAmount,
      roomCount,
      adults,
      children,
      guestDetails,
      contactDetails,
      identityDetails,
      billingDetails
    });

    return res.status(201).json({ success: true, ...result });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const bookings = await Booking.find(filter).populate('category');
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

// Book many rooms (legacy support)
exports.bookManyRooms = async (req, res) => {
  try {
    const { bookings } = req.body;
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ error: 'No bookings requested' });
    }

    const results = [];

    for (const bookingRequest of bookings) {
      const { categoryId, count, ...extraDetails } = bookingRequest;
      const result = await handleBooking(categoryId, count, extraDetails);
      results.push(result);
    }

    res.status(201).json({ success: true, booked: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Unbook (soft delete)
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

// PERMANENTLY DELETE a booking
exports.permanentlyDeleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const deleted = await Booking.findByIdAndDelete(bookingId);
    if (!deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
