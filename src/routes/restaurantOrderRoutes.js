const express = require('express');
const restaurantOrderController = require('../controllers/restaurantOrderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/details/:id', restaurantOrderController.getOrderDetails);
router.get('/table/:tableNo', restaurantOrderController.getOrdersByTable);
router.get('/invoice/:id', restaurantOrderController.generateInvoice);
router.get('/all', restaurantOrderController.getAllOrders);
router.post('/create', authMiddleware(['admin', 'staff']), restaurantOrderController.createOrder);
router.patch('/:id/status', authMiddleware(['admin', 'staff']), restaurantOrderController.updateOrderStatus);


module.exports = router;