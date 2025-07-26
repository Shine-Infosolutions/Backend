const CabBooking = require('../models/cabBooking');
const Room = require('../models/Room');
const Driver = require('../models/Driver');

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
      driverId, // ✔️ Now accepting driverId
    } = req.body;

    if (!pickupLocation) return res.status(400).json({ error: 'Pickup location is required' });
    if (!destination) return res.status(400).json({ error: 'Destination is required' });
    if (!pickupTime) return res.status(400).json({ error: 'Pickup time is required' });

    if (roomNumber) {
      const room = await Room.findOne({ roomNumber });
      if (!room) return res.status(404).json({ error: 'Room not found' });
    }

    let driverName = '';
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) return res.status(404).json({ error: 'Driver not found' });
      driverName = driver.name;
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
      driverId,
      driverName, // Snapshot
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
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;

    const bookings = await CabBooking.find(filter)
      .populate('driverId', 'name contactNumber') // optional
      .sort({ pickupTime: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Get a single cab booking by ID ────────────────────────────────────────
exports.getCabBookingById = async (req, res) => {
  try {
    const booking = await CabBooking.findById(req.params.id)
      .populate('driverId', 'name contactNumber');

    if (!booking) return res.status(404).json({ success: false, error: 'Cab booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Update any fields on a booking ───────────────────────────────────────
exports.updateCabBooking = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If driverId is being updated, update driverName snapshot
    if (updates.driverId) {
      const driver = await Driver.findById(updates.driverId);
      if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
      updates.driverName = driver.name;
    }

    const updated = await CabBooking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ success: false, error: 'Booking not found' });
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

    const cancelled = await CabBooking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!cancelled) return res.status(404).json({ success: false, error: 'Booking not found' });

    res.json({ success: true, booking: cancelled });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Delete a booking permanently ─────────────────────────────────────────
exports.deleteCabBooking = async (req, res) => {
  try {
    const deleted = await CabBooking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Booking not found' });

    res.json({ success: true, message: 'Cab booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Get bookings by Driver ID (optional filter) ──────────────────────────
exports.getCabBookingsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const bookings = await CabBooking.find({ driverId }).sort({ pickupTime: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
