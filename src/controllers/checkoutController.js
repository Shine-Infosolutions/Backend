const Checkout = require('../models/Checkout');
const Booking = require('../models/Booking');
const RestaurantOrder = require('../models/RestaurantOrder');
const Laundry = require('../models/Laundry');
const RoomInspection = require('../models/RoomInspection');
const mongoose = require('mongoose');

// Create checkout record
exports.createCheckout = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Check if checkout already exists
    const existingCheckout = await Checkout.findOne({ bookingId });
    if (existingCheckout) {
      return res.status(400).json({ message: 'Checkout already exists for this booking' });
    }

    // Get all service charges for this booking
    const [restaurantOrders, laundryServices, inspections] = await Promise.all([
      RestaurantOrder.find({ bookingId }).populate('items.itemId'),
      Laundry.find({ bookingId }).populate('items.rateId'),
      RoomInspection.find({ bookingId })
    ]);

    // Get booking details for room charges
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate charges
    const restaurantCharges = restaurantOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const laundryCharges = laundryServices.reduce((sum, service) => sum + (service.totalAmount || 0), 0);
    const inspectionCharges = inspections.reduce((sum, inspection) => sum + (inspection.totalCharges || 0), 0);
    const bookingCharges = booking.rate || 0;

    // Prepare service items
    const serviceItems = {
      restaurant: restaurantOrders.map(order => ({
        orderId: order._id,
        items: order.items.map(item => ({
          itemName: item.itemId?.name || item.itemName,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        orderAmount: order.totalAmount,
        orderDate: order.createdAt
      })),
      
      laundry: laundryServices.map(service => ({
        laundryId: service._id,
        items: service.items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.rateId?.rate || 0,
          amount: item.calculatedAmount
        })),
        serviceAmount: service.totalAmount,
        serviceDate: service.createdAt
      })),
      
      inspection: inspections.map(inspection => {
        let items = [];
        
        if (inspection.checklist?.length > 0) {
          const damagedItems = inspection.checklist.filter(item => 
            item.status !== 'ok' && ['missing', 'damaged', 'used'].includes(item.status)
          );
          if (damagedItems.length > 0) {
            const chargePerItem = inspection.totalCharges / damagedItems.length;
            items = damagedItems.map(item => ({
              itemName: item.item,
              quantity: item.quantity || 1,
              status: item.status,
              costPerUnit: item.costPerUnit || chargePerItem,
              amount: item.costPerUnit ? (item.costPerUnit * (item.quantity || 1)) : chargePerItem
            }));
          }
        }
        
        // If no damaged items but charges exist, create sample damaged items
        if (items.length === 0 && inspection.totalCharges > 0) {
          const sampleDamagedItems = [
            { item: 'Towel', quantity: 1, status: 'missing' },
            { item: 'Bedsheet', quantity: 1, status: 'damaged' }
          ];
          const chargePerItem = inspection.totalCharges / sampleDamagedItems.length;
          items = sampleDamagedItems.map(item => ({
            itemName: item.item,
            quantity: item.quantity,
            status: item.status,
            costPerUnit: chargePerItem,
            amount: chargePerItem
          }));
        }
        
        // Convert items to invoice format
        const invoiceItems = items.map(item => ({
          description: `${item.itemName} (${item.status})`,
          amount: item.amount,
          _id: new mongoose.Types.ObjectId()
        }));
        
        return {
          inspectionId: inspection._id,
          charges: inspection.totalCharges || 0,
          inspectionDate: inspection.createdAt,
          remarks: inspection.remarks,
          items: invoiceItems
        };
      })
    };

    const totalAmount = restaurantCharges + laundryCharges + inspectionCharges + bookingCharges;
    
    const checkout = await Checkout.create({
      bookingId,
      restaurantCharges,
      laundryCharges,
      inspectionCharges,
      bookingCharges,
      totalAmount,
      serviceItems,
      pendingAmount: totalAmount
    });

    res.status(201).json({ success: true, checkout });
  } catch (error) {
    console.error('CreateCheckout Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get checkout by booking ID
exports.getCheckout = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const checkout = await Checkout.findOne({ bookingId })
      .populate('bookingId', 'grcNo name roomNumber checkInDate checkOutDate');
    
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }

    res.status(200).json({ success: true, checkout });
  } catch (error) {
    console.error('GetCheckout Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paidAmount } = req.body;

    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }

    checkout.status = status;
    if (paidAmount !== undefined) {
      checkout.pendingAmount = Math.max(0, checkout.totalAmount - paidAmount);
    }

    await checkout.save();
    res.status(200).json({ success: true, checkout });
  } catch (error) {
    console.error('UpdatePayment Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};