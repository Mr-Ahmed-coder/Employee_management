const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getLeaveRequests,
    updateLeaveStatus,
    getLeaveBalance,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Balance (must be before /:id)
router.get('/balance/:employeeId', getLeaveBalance);

// CRUD
router.route('/')
    .get(getLeaveRequests)
    .post(applyLeave);

// Approve/Reject
router.put('/:id/status', authorize('Admin', 'HR', 'Manager'), updateLeaveStatus);

module.exports = router;
