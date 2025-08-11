const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.js');
const categoryRoutes = require('./src/routes/category.js');
const bookingRoutes = require('./src/routes/booking.js');
const roomRoutes = require('./src/routes/roomRoutes.js');
const reservationRoutes = require('./src/routes/reservation.js');
const housekeepingRoutes = require('./src/routes/housekeepingRoutes.js');
const laundryRoutes = require('./src/routes/laundryRoutes.js');
const cabRoutes = require('./src/routes/cabBookingRoutes.js');
const driverRoutes = require('./src/routes/driverRoutes.js');
const vehicleRoutes = require('./src/routes/vehicleRoutes.js');
const inventoryRoutes = require('./src/routes/inventoryRoutes.js');
const purchaseOrderRoutes = require('./src/routes/purchaseOrderRoutes.js');
const pantryRoutes = require('./src/routes/pantryRoutes.js');
const tableRoutes = require('./src/routes/tableRoutes.js');
const itemRoutes = require('./src/routes/itemRoutes');
const couponRoutes = require('./src/routes/coupon');
const restaurantCategoryRoutes = require('./src/routes/restaurantCategoryRoutes');
const restaurantOrderRoutes = require('./src/routes/restaurantOrderRoutes');
const kotRoutes = require('./src/routes/kotRoutes');
const billRoutes = require('./src/routes/billRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const paginationRoutes = require('./src/routes/paginationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes.js');
const roomInventoryRoutes = require('./src/routes/roomInventoryRoutes.js');
const paymentRoutes = require('./src/routes/paymentRoutes.js');
const path = require('path');
// Initialize express app
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://backend-hazel-xi.vercel.app",
  "https://buddha-crm.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files for fallback method
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Database connection for serverless environment
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }
  
  try {
    // Connect to MongoDB with optimized settings for serverless
    const client = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/login', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
    });
    
    console.log('MongoDB connected successfully');
    cachedDb = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    // Skip DB connection check for health endpoint
    if (req.path === '/health') {
      return next();
    }
    
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/cab', cabRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/restaurant', tableRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/restaurant-categories', restaurantCategoryRoutes);
app.use('/api/restaurant-orders', restaurantOrderRoutes);
app.use('/api/kot', kotRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/paginate', paginationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/room-inventory', roomInventoryRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    dbConnected: !!cachedDb
  });
});

app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for serverless
module.exports = app;
