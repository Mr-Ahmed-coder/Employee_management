const Employee = require('../models/Employee');

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, HR)
const createEmployee = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, address,
            designation, department, joiningDate, salary, status,
        } = req.body;

        // Check if employee with this email already exists
        const existing = await Employee.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists',
            });
        }

        const employee = await Employee.create({
            firstName,
            lastName,
            email,
            phone,
            address,
            designation,
            department,
            joiningDate,
            salary,
            status: status || 'Active',
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists',
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin, HR, Manager)
const getEmployees = async (req, res) => {
    try {
        const { search, department, status, page = 1, limit = 50 } = req.query;

        let query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by department
        if (department) {
            query.department = department;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const total = await Employee.countDocuments(query);
        const employees = await Employee.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: employees.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: employees,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR)
const updateEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Check for email uniqueness if email is being changed
        if (req.body.email && req.body.email !== employee.email) {
            const emailExists = await Employee.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Another employee with this email already exists',
                });
            }
        }

        employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        await Employee.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get employee stats
// @route   GET /api/employees/stats/overview
// @access  Private (Admin, HR, Manager)
const getEmployeeStats = async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        const active = await Employee.countDocuments({ status: 'Active' });
        const inactive = await Employee.countDocuments({ status: 'Inactive' });

        const departments = await Employee.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                active,
                inactive,
                departments,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current employee's profile
// @route   GET /api/employees/me
// @access  Private
const getMyEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({ email: req.user.email });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found for your account',
            });
        }

        res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    getMyEmployee,
};
