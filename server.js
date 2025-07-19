const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/category');
const bookingRoutes = require('./src/routes/booking');
//const departmentRoutes = require('./src/routes/department');
//const employeeRoutes = require('./src/routes/employee');
const roomRoutes = require('./src/routes/roomRoutes');
const reservationRoutes = require('./src/routes/reservation');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/login', {
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
//app.use('/api/departments', departmentRoutes);
//app.use('/api/employees', employeeRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

