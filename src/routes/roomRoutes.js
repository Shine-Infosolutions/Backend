const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new room (admin only)
router.post('/add',  roomController.createRoom);
// Get all rooms
router.get('/all', roomController.getRooms);
// Get a room by ID
router.get('/get/:id', roomController.getRoomById);
// Update a room (admin only)
router.put('/update/:id', authMiddleware(['admin']), roomController.updateRoom);
// Delete a room (admin only)
router.delete('/delete/:id', authMiddleware(['admin']), roomController.deleteRoom);
// Get rooms by category with booking status
router.get('/category/:categoryId', roomController.getRoomsByCategory);
// Get all available rooms
router.get('/available', roomController.getAvailableRooms);

module.exports = router;
