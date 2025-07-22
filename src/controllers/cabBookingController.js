const CabBooking = require('../models/cabBooking');
const Room = require('../models/Room');

// Create a new cab booking
exports.createCabBooking = async (req, res) => {
  try {
    const { roomNumber, guestName, pickupTime, destination, cabType, specialInstructions } = req.body;
    
    // Verify room exists
    const room = await Room.findOne({ room_number: roomNumber });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const booking = new CabBooking({
      roomNumber,
      guestName,
      pickupTime: new Date(pickupTime),
      destination,
      cabType,
      specialInstructions,
      createdBy: req.user.id,
      status: 'pending'
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
    
    // Build filter based on query parameters
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

// Update cab booking status
exports.updateCabBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const booking = await CabBooking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete cab booking
exports.deleteCabBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await CabBooking.findByIdAndDelete(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Cab booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
