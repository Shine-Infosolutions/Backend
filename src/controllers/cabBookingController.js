const CabBooking = require('../models/cabBooking');
const Room = require('../models/Room');

// Create a new cab booking
exports.createCabBooking = async (req, res) => {
  try {
    const {
      purpose = 'guest_transport',
      guestName,
      roomNumber,
      grcNo,
      guestType = 'inhouse',
      pickupLocation,
      destination,
      pickupTime,
      cabType = 'standard',
      specialInstructions,
      scheduled = false,
      estimatedFare,
      actualFare,
      distanceInKm,
      paymentStatus = 'unpaid',
      vehicleNumber,
      driverName,
      driverContact,
    } = req.body;

    // Validate required fields
    // if (!purpose) {
    //   return res.status(400).json({ error: 'Purpose is required' });
    // }
    if (!pickupLocation) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    if (!pickupTime) {
      return res.status(400).json({ error: 'Pickup time is required' });
    }

    // Verify room if roomNumber provided
    if (roomNumber) {
      const room = await Room.findOne({ room_number: roomNumber });
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
    }

    const booking = new CabBooking({
      purpose,
      guestName,
      roomNumber,
      grcNo,
      guestType,
      pickupLocation,
      destination,
      pickupTime: new Date(pickupTime),
      cabType,
      specialInstructions,
      scheduled,
      estimatedFare,
      actualFare,
      distanceInKm,
      paymentStatus,
      vehicleNumber,
      driverName,
      driverContact,
      createdBy: req.user.id,
      status: 'pending',
    });

    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all cab bookings
exports.getAllCabBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await CabBooking.find(filter)
      .populate('createdBy', 'username')
      .sort({ pickupTime: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single cab booking by ID
exports.getCabBookingById = async (req, res) => {
  try {
    const booking = await CabBooking.findById(req.params.id).populate('createdBy', 'username');
    if (!booking) return res.status(404).json({ error: 'Cab booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update cab booking status and/or other fields
exports.updateCabBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: validate status and enums here if needed

    const booking = await CabBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete cab booking
exports.deleteCabBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await CabBooking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Cab booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
