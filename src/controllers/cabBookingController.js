const CabBooking = require('../models/cabBooking');
const Room       = require('../models/Room');

// ── Create a new cab booking ─────────────────────────────────────────────
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
      vehicleNumber,
      driverName,
      driverContact,
    } = req.body;

    // Validate required fields
    if (!pickupLocation) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    if (!pickupTime) {
      return res.status(400).json({ error: 'Pickup time is required' });
    }

    // If roomNumber provided, verify it exists
    if (roomNumber) {
      const room = await Room.findOne({ roomNumber });
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
      vehicleNumber,
      driverName,
      driverContact,
      createdBy: req.user.id,
      status: 'pending',
    });

    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ── Get all cab bookings ─────────────────────────────────────────────────
exports.getAllCabBookings = async (req, res) => {
  try {
    const { status, purpose } = req.query;
    const filter = {};

    if (status)  filter.status  = status;
    if (purpose) filter.purpose = purpose;

    const bookings = await CabBooking.find(filter)
      .sort({ pickupTime: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Get a single cab booking by ID ────────────────────────────────────────
exports.getCabBookingById = async (req, res) => {
  try {
    const booking = await CabBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Cab booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Update any fields on a booking ───────────────────────────────────────
exports.updateCabBooking = async (req, res) => {
  try {
    const updated = await CabBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, booking: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ── Cancel a booking ─────────────────────────────────────────────────────
exports.cancelCabBooking = async (req, res) => {
  try {
    const updates = {
      status: 'cancelled',
      cancellationReason: req.body.cancellationReason || 'No reason provided'
    };

    const cancelled = await CabBooking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, booking: cancelled });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Delete a booking permanently ─────────────────────────────────────────
exports.deleteCabBooking = async (req, res) => {
  try {
    const deleted = await CabBooking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, message: 'Cab booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
