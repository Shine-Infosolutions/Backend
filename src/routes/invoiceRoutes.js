const express = require('express');
const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  getFinalInvoiceByBooking
} = require('../controllers/invoiceController');  // ✅ Make sure path is correct

// POST /api/invoices/create
router.post('/create', createInvoice);  // ✅ Function hona chahiye

// GET /api/invoices/all
router.get('/all', getAllInvoices);    // ✅ Function hona chahiye

// GET /api/invoices/final/:bookingId
router.get('/final/:bookingId', getFinalInvoiceByBooking); // ✅ Function hona chahiye

module.exports = router;
