const Housekeeping = require('../models/Housekeeping');
const User = require('../models/User.js');
const Room = require('../models/Room');

// Create a new housekeeping task
exports.createTask = async (req, res) => {
  try {
    const { roomId, cleaningType, notes, priority, assignedTo } = req.body;
    
    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const task = new Housekeeping({
      roomId,
      cleaningType,
      notes,
      priority,
      assignedTo,
      status: 'pending'
    });
    
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all housekeeping tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, cleaningType } = req.query;
    
    // Build filter based on query parameters
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (cleaningType) filter.cleaningType = cleaningType;
    
    const tasks = await Housekeeping.find(filter)
      .populate('roomId')
      .populate('assignedTo', 'username')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single housekeeping task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Housekeeping.findById(taskId)
      .populate('roomId')
      .populate('assignedTo', 'username')
      .populate('verifiedBy', 'username');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned to specific staff
exports.getStaffTasks = async (req, res) => {
  try {
    const { staffId } = req.params;
    const tasks = await Housekeeping.find({ assignedTo: staffId })
      .populate('roomId')
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    const task = await Housekeeping.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is authorized to update this task
    const isAdmin = req.user.role === 'admin';
    const isStaff = req.user.role === 'staff';
    
    // Temporarily allow all staff to update tasks
    if (!isAdmin && !isStaff) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }
    
    // Only admin can verify tasks
    if (status === 'verified' && !isAdmin) {
      return res.status(403).json({ error: 'Only administrators can verify tasks' });
    }
    
    // Update status and timestamps based on new status
    task.status = status;
    if (notes) task.notes = notes;
    
    if (status === 'in-progress' && !task.startTime) {
      task.startTime = new Date();
    }
    
    if (status === 'completed' && !task.endTime) {
      const endTime = new Date();
      task.endTime = endTime;
      
      // Calculate completion time in minutes
      if (task.startTime) {
        const startTime = new Date(task.startTime);
        const diffMs = endTime - startTime;
        task.completionTime = Math.round(diffMs / 60000); // Convert ms to minutes
      }
      
      // When task is completed, update the room status to available
      if (task.roomId) {
        const room = await Room.findById(task.roomId);
        if (room) {
          console.log(`Updating room ${room.room_number} status from ${room.status} to available`);
          room.status = 'available';
          await room.save();
          console.log(`Room status updated to: ${room.status}`);
        } else {
          console.log(`Room not found for task: ${task._id}`);
        }
      }
    }
    
    if (status === 'verified') {
      task.verifiedBy = req.user.id;
    }
    
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Assign task to staff
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { staffId } = req.body;
    
    const task = await Housekeeping.findByIdAndUpdate(
      taskId,
      { assignedTo: staffId },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Report issue with room
exports.reportIssue = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;
    
    const task = await Housekeeping.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.issues.push({ description, resolved: false });
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Resolve reported issue
exports.resolveIssue = async (req, res) => {
  try {
    const { taskId, issueId } = req.params;
    
    const task = await Housekeeping.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const issue = task.issues.id(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    issue.resolved = true;
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Housekeeping.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room cleaning history
exports.getRoomHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const history = await Housekeeping.find({ roomId })
      .populate('assignedTo', 'username')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available housekeeping staff
exports.getAvailableStaff = async (req, res) => {
  try {
    // Find users with housekeeping department who aren't assigned to active tasks
    const busyStaffIds = await Housekeeping.find({
      status: { $in: ['pending', 'in-progress'] }
    }).distinct('assignedTo');
    
    const availableStaff = await User.find({
      _id: { $nin: busyStaffIds },
      'department.name': 'housekeeping',
      role: 'staff'
    }).select('_id username');
    
    res.json({ success: true, availableStaff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload before cleaning images
exports.uploadBeforeImages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'Image URLs must be provided as an array' });
    }
    
    const task = await Housekeeping.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Initialize images object if it doesn't exist
    if (!task.images) {
      task.images = { before: [], after: [] };
    }
    
    // Add new images
    const newImages = imageUrls.map(url => ({
      url,
      uploadedAt: new Date()
    }));
    
    task.images.before.push(...newImages);
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload after cleaning images
exports.uploadAfterImages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'Image URLs must be provided as an array' });
    }
    
    const task = await Housekeeping.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Initialize images object if it doesn't exist
    if (!task.images) {
      task.images = { before: [], after: [] };
    }
    
    // Add new images
    const newImages = imageUrls.map(url => ({
      url,
      uploadedAt: new Date()
    }));
    
    task.images.after.push(...newImages);
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};