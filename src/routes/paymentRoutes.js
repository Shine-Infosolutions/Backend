const express = require('express');
const {
  createPayment,
  getAllPayments,
  getPaymentsByService,
  getTotalPaidAmount
} = require('../controllers/paymentController');

const router = express.Router();

// @route   POST /api/payments
// @desc    Create new payment
router.post('/', createPayment);

// @route   GET /api/payments/all
// @desc    Get all payments (with optional filters: ?sourceType=&sourceId=)
router.get('/all', getAllPayments);

// @route   GET /api/payments/:sourceType/:sourceId
// @desc    Get all payments for a specific service (Booking, Cab, etc.)
router.get('/:sourceType/:sourceId', getPaymentsByService);

// @route   GET /api/payments/total/:sourceType/:sourceId
// @desc    Get total paid amount for a service
router.get('/total/:sourceType/:sourceId', getTotalPaidAmount);

module.exports = router;
