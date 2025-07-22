const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// Create a new housekeeping task (admin or staff from reception/housekeeping)
router.post(
  '/tasks',
  authMiddleware(['admin', 'staff'], ['reception', 'housekeeping']),
  housekeepingController.createTask
);

// Get all housekeeping tasks
router.get(
  '/tasks',
  authMiddleware(['admin', 'staff'], ['housekeeping']),
  housekeepingController.getAllTasks
);

// Get a single task by ID
router.get(
  '/tasks/:taskId',
  authMiddleware(['admin', 'staff'], ['housekeeping']),
  housekeepingController.getTaskById
);

// Get tasks assigned to specific staff
router.get(
  '/staff/:staffId/tasks',
  authMiddleware(['admin', 'staff']), // Allow any staff to view their own tasks
  housekeepingController.getStaffTasks
);

// Update task status
router.patch(
  '/tasks/:taskId/status',
  authMiddleware(['admin', 'staff']), // Allow any staff, controller will check permissions
  housekeepingController.updateTaskStatus
);

// Assign task to staff
router.put(
  '/tasks/:taskId/assign',
  authMiddleware(['admin', 'staff'], ['housekeeping']),
  housekeepingController.assignTask
);

// Report issue with room
router.post(
  '/tasks/:taskId/issues',
  authMiddleware(['admin', 'staff'], ['housekeeping']),
  housekeepingController.reportIssue
);

// Resolve reported issue
router.put(
  '/tasks/:taskId/issues/:issueId/resolve',
  authMiddleware(['admin', 'staff'], ['housekeeping']),
  housekeepingController.resolveIssue
);

// Delete a task
router.delete(
  '/tasks/:taskId',
  authMiddleware(['admin']),
  housekeepingController.deleteTask
);

// Get room cleaning history
router.get(
  '/rooms/:roomId/history',
  authMiddleware(['admin', 'staff'], ['housekeeping', 'reception']),
  housekeepingController.getRoomHistory
);

// Get available housekeeping staff
router.get(
  '/available-staff',
  authMiddleware(['admin', 'staff'], ['reception', 'housekeeping']),
  housekeepingController.getAvailableStaff
);

// Upload before cleaning images
router.post(
  '/tasks/:taskId/images/before',
  authMiddleware(['admin', 'staff']), // Allow any staff or admin to upload images
  housekeepingController.uploadBeforeImages
);

// Upload after cleaning images
router.post(
  '/tasks/:taskId/images/after',
  authMiddleware(['admin', 'staff']), // Allow any staff or admin to upload images
  housekeepingController.uploadAfterImages
);

// Base64 fallback routes for CORS issues
router.post(
  '/tasks/:taskId/images/before/base64',
  authMiddleware(['admin', 'staff']),
  uploadController.uploadBase64Images
);

router.post(
  '/tasks/:taskId/images/after/base64',
  authMiddleware(['admin', 'staff']),
  uploadController.uploadBase64Images
);

module.exports = router;