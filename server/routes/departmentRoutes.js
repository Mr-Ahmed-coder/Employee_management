const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getDepartments,
    getDepartment,
    getDepartmentEmployees,
    updateDepartment,
    deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// CRUD routes
router.route('/')
    .get(authorize('Admin', 'HR', 'Manager'), getDepartments)
    .post(authorize('Admin', 'HR'), createDepartment);

router.route('/:id')
    .get(authorize('Admin', 'HR', 'Manager'), getDepartment)
    .put(authorize('Admin', 'HR'), updateDepartment)
    .delete(authorize('Admin'), deleteDepartment);

// Department employees
router.get('/:id/employees', authorize('Admin', 'HR', 'Manager'), getDepartmentEmployees);

module.exports = router;
