const express = require('express');
const router = express.Router();
const {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    getMyEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id to avoid conflict)
router.get('/stats/overview', authorize('Admin', 'HR', 'Manager'), getEmployeeStats);

// Get current user's employee profile
router.get('/me', getMyEmployee);

// CRUD routes
router.route('/')
    .get(authorize('Admin', 'HR', 'Manager'), getEmployees)
    .post(authorize('Admin', 'HR'), createEmployee);

router.route('/:id')
    .get(authorize('Admin', 'HR', 'Manager'), getEmployee)
    .put(authorize('Admin', 'HR'), updateEmployee)
    .delete(authorize('Admin'), deleteEmployee);

module.exports = router;
