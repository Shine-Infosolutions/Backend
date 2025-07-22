const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

exports.register = async (req, res) => {
  try {
    const {email, username, password, role, department } = req.body;
    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only admin or staff allowed.' });
    }
    // const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    // if (existingUser) {
    //   return res.status(409).json({ message: 'Email or username already exists' });
    // }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if( existingUser ) {
        return res.status(409).json({ message: 'Emai; or username already exists' });
    }
    if (role === 'staff' && !department) {
      return res.status(400).json({ message: 'Staff must have a department' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let userData = { email, username, password: hashedPassword, role };
    if (role === 'staff') {
      // Store department as array of objects with id and name
      userData.department = Array.isArray(department)
        ? department.map(dep => ({ id: dep.id, name: dep.name }))
        : department;
    } else if (role === 'admin') {
      userData.department = [
        { id: 1, name: 'kitchen' },
        { id: 2, name: 'laundry' },
        { id: 3, name: 'reception' },
        { id: 4, name: 'maintenance' },
        { id: 5, name: 'other' },
        { id: 6, name: 'housekeeping' }
      ];
    }
    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role, department: user.department }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
    res.json({ token, role: user.role, department: user.department, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getStaffProfile = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Find the user with their department details
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For staff users, return their specific data
    if (user.role === 'staff') {
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        departments: user.department,
        createdAt: user.createdAt
      });
    } 
    // For admin users
    else if (user.role === 'admin') {
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        departments: user.department,
        isAdmin: true,
        createdAt: user.createdAt
      });
    }
    
    // Fallback
    return res.json(user);
    
  } catch (err) {
    console.error('Error in getStaffProfile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};