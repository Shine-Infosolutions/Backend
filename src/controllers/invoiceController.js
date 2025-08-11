const Invoice = require('../models/Invoice');

// 🔹 Create Invoice
const Booking = require('../models/Booking');
const Reservation = require('../models/Reservation');
const CabBooking = require('../models/cabBooking');
const RestaurantOrder = require('../models/RestaurantOrder');
const Room = require('../models/Room'); 
const RoomInspection = require('../models/RoomInspection');
// 🧮 Generate unique invoice number
const generateInvoiceNumber = async () => {
  let invoiceNumber, exists = true;
  while (exists) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    invoiceNumber = `INV-${rand}`;
    exists = await Invoice.findOne({ invoiceNumber });
  }
  return invoiceNumber;
};

const serviceModels = {
  Booking,
  Reservation,
  CabBooking,
  RestaurantOrder,
  Room,
  Housekeeping: RoomInspection
};

exports.createInvoice = async (req, res) => {
    try {
      const { serviceType, serviceRefId, tax = 0, discount = 0, paymentMode } = req.body;
  
      if (!serviceType || !serviceRefId) {
        return res.status(400).json({ error: 'serviceType and serviceRefId are required' });
      }
  
      const model = serviceModels[serviceType];
      if (!model) {
        return res.status(400).json({ error: 'Invalid service type' });
      }
  
      const serviceDoc = await model.findById(serviceRefId);
      if (!serviceDoc) {
        return res.status(404).json({ error: `${serviceType} not found` });
      }
  
      let items = [];
      let subTotal = 0;
      let bookingId = serviceType === 'Booking' ? serviceRefId : serviceDoc.bookingId || undefined;
  
      // ✅ Custom logic for Booking invoice
      if (serviceType === 'Booking') {
        const { checkInDate, checkOutDate, rate = 0 } = serviceDoc;
  
        // Calculate number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = Math.abs(checkOut - checkIn);
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
        const roomCharge = numberOfNights * rate;
  
        items.push({
          description: `Room Charges (${numberOfNights} Night${numberOfNights > 1 ? 's' : ''})`,
          amount: roomCharge
        });
  
        subTotal = roomCharge;
      } 
      else if (req.body.items && Array.isArray(req.body.items)) {
        // Use passed items for other services
        items = req.body.items;
        subTotal = items.reduce((acc, item) => acc + item.amount, 0);
      } else {
        return res.status(400).json({ error: 'Items are required for non-booking services' });
      }
  
      const totalAmount = subTotal + tax - discount;
      const invoiceNumber = await generateInvoiceNumber();
  
      const invoice = new Invoice({
        serviceType,
        serviceRefId,
        invoiceNumber,
        items,
        subTotal,
        tax,
        discount,
        totalAmount,
        paymentMode,
        status: 'Unpaid',
        bookingId
      });
  
      await invoice.save();
  
      res.status(201).json({ success: true, invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

// 🔹 Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('serviceRefId');
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Final Invoice by Booking ID
exports.getFinalInvoiceByBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
  
      const invoices = await Invoice.find({ bookingId }).populate('serviceRefId');
  
      const totalAmount = invoices.reduce((acc, invoice) => acc + invoice.totalAmount, 0);
  
      return res.status(200).json({
        success: true,
        totalInvoiceCount: invoices.length,
        grandTotal: totalAmount,
        invoices
      });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong', message: error.message });
    }
  };
  
