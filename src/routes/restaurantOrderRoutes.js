const express = require('express');
const router = express.Router();
const restaurantOrderController = require('../controllers/restaurantOrderController');
const authMiddleware = require('../middleware/authMiddleware');

// Create order
router.post('/orders', authMiddleware(['admin', 'staff']), restaurantOrderController.createOrder);

// Get all orders
router.get('/orders', authMiddleware(['admin', 'staff']), restaurantOrderController.getAllOrders);

// Get order by ID
router.get('/orders/:orderId', authMiddleware(['admin', 'staff']), restaurantOrderController.getOrderById);

// Update order status
router.patch('/orders/:orderId/status', authMiddleware(['admin', 'staff']), restaurantOrderController.updateOrderStatus);

// Get available items
router.get('/items', authMiddleware(['admin', 'staff']), restaurantOrderController.getAvailableItems);

module.exports = router;