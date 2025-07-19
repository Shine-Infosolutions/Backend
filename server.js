const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/category');
const bookingRoutes = require('./src/routes/booking');
const roomRoutes = require('./src/routes/roomRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let isConnected = false;

// Connect to MongoDB with improved settings
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/login', {
  serverSelectionTimeoutMS: 30000,  // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,           // Socket timeout
  connectTimeoutMS: 30000,          // Connection timeout
})
.then(() => {
  isConnected = true;
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Add connection event listeners
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Middleware to check database connection before processing requests
app.use((req, res, next) => {
  if (!isConnected && req.path !== '/health') {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    dbConnected: isConnected
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
