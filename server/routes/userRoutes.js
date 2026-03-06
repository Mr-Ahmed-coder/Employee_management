const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Admin and HR can view all users
router.get('/', authorize('Admin', 'HR'), getUsers);

// Admin only — update role & delete user
router.put('/:id/role', authorize('Admin'), updateUserRole);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
