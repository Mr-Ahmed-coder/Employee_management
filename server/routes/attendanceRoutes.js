const express = require('express');
const router = express.Router();
const {
    markAttendance,
    bulkMarkAttendance,
    getAttendanceRecords,
    getAttendanceByDate,
    getMonthlyReport,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Reports (must be before /:id routes)
router.get('/report/monthly', authorize('Admin', 'HR', 'Manager'), getMonthlyReport);
router.get('/date/:date', authorize('Admin', 'HR', 'Manager'), getAttendanceByDate);

// Mark attendance
router.post('/', authorize('Admin', 'HR', 'Manager'), markAttendance);
router.post('/bulk', authorize('Admin', 'HR', 'Manager'), bulkMarkAttendance);

// Get records (all roles can access, controller filters by role)
router.get('/', getAttendanceRecords);

module.exports = router;
