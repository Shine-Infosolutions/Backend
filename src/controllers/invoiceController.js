const Invoice = require('../models/Invoice');

const Booking = require('../models/Booking');
const Reservation = require('../models/Reservation');
const CabBooking = require('../models/cabBooking');
const RestaurantOrder = require('../models/RestaurantOrder');
const Room = require('../models/Room'); 
const Housekeeping = require('../models/Housekeeping'); 
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
  //Housekeeping,
  RoomInspection
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

    // ===== Booking Charges =====
    if (serviceType === 'Booking') {
      const { checkInDate, checkOutDate, rate = 0 } = serviceDoc;
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

    // // ===== Housekeeping Charges =====
    // else if (serviceType === 'Housekeeping') {
    //   const tasks = serviceDoc.tasks || [];
    //   items = tasks.map(task => ({
    //     description: `${task.taskName} - ${task.notes || ''}`,
    //     amount: task.cost || 0
    //   }));
    //   subTotal = items.reduce((sum, i) => sum + i.amount, 0);
    // }

    // ===== Room Inspection Charges =====
    else if (serviceType === 'RoomInspection') {
      const inspectionItems = serviceDoc.checklist || [];
    
     // Map only damaged or non-OK items
  items = inspectionItems
  .filter(i => i.status && i.status.toLowerCase() !== 'ok')
  .map(i => ({
    description: `${i.itemName || i.name || 'Item'} (${i.status})`,
    amount: i.cost || i.price || 0
  }));
    
      subTotal = items.reduce((sum, i) => sum + i.amount, 0);
    
      // fallback if subTotal still zero
      if (subTotal === 0 && serviceDoc.totalCharges) {
        items = [{
          description: `Room Inspection - ${serviceDoc.inspectionType}`,
          amount: serviceDoc.totalCharges
        }];
        subTotal = serviceDoc.totalCharges;
      }
    }    

    // ===== Other Services (Cab, Restaurant, etc.) =====
    else if (req.body.items && Array.isArray(req.body.items)) {
      items = req.body.items;
      subTotal = items.reduce((acc, item) => acc + item.amount, 0);
    } else {
      return res.status(400).json({ error: 'Items are required for this service type' });
    }

    // ===== Final Amounts =====
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
      paidAmount: 0,
      balanceAmount: totalAmount,
      bookingId
    });

    await invoice.save();

    // 🔄 OPTIONAL: Automatically update payment module
    if (serviceType === 'Booking') {
      await Booking.findByIdAndUpdate(bookingId, { invoiceId: invoice._id });
    }

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
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
