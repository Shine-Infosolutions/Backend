// const CabBooking = require("../models/carBooking");
// const Room = require("../models/Room");


// exports.createCabBooking = async (req, res) => {
//     try{
//         const { roomNumber, guestName, pickupTime, destination, cabType, specialInstructions } = req.body;

//         const room = await Room.findOne({ number: roomNumber });
//         if (!room) {
//             res. res.status(404).json({ error: 'Room not found' });
//          }
//          const booking = new CabBooking({
//             roomNumber,
//             guestName,
//             pickupTime,
//             destination,
//             cabType,
//             specialInstructions,
//             createdBy: req.user._id // Assuming user ID is available in req.user
//         });

//         await booking.save();
//         res.status(201).json({ success: true, booking });
//     } catch (error) {
//         console.error('Cab booking creation error:', error);
//         res.status(500).json({ error: 'Failed to create cab booking' });
//     }
// }

// exports.getCabBookings = async (req, res) => {
//     try{
//         const { status } = req.query;
//         const filter = {};
//         if (status) {
//             filter.status = status;

//             const booking = 
//         }

//     }