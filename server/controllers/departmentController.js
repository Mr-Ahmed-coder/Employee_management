const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin, HR)
const createDepartment = async (req, res) => {
    try {
        const { name, description, head } = req.body;

        const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists',
            });
        }

        const department = await Department.create({ name, description, head: head || null });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all departments with employee counts
// @route   GET /api/departments
// @access  Private (Admin, HR, Manager)
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('head', 'firstName lastName designation')
            .sort({ name: 1 });

        // Get employee counts per department
        const deptData = await Promise.all(
            departments.map(async (dept) => {
                const employeeCount = await Employee.countDocuments({ department: dept.name });
                return {
                    ...dept.toObject(),
                    employeeCount,
                };
            })
        );

        res.status(200).json({
            success: true,
            count: deptData.length,
            data: deptData,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('head', 'firstName lastName email designation');

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const employeeCount = await Employee.countDocuments({ department: department.name });

        res.status(200).json({
            success: true,
            data: { ...department.toObject(), employeeCount },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get employees in a department
// @route   GET /api/departments/:id/employees
// @access  Private (Admin, HR, Manager)
const getDepartmentEmployees = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const employees = await Employee.find({ department: department.name })
            .sort({ firstName: 1 });

        res.status(200).json({
            success: true,
            count: employees.length,
            department: department.name,
            data: employees,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
const updateDepartment = async (req, res) => {
    try {
        const { name, description, head } = req.body;
        let department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Check name uniqueness if name changed
        if (name && name !== department.name) {
            const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Department name already exists' });
            }

            // Update department name in all employees
            await Employee.updateMany(
                { department: department.name },
                { department: name }
            );
        }

        department = await Department.findByIdAndUpdate(
            req.params.id,
            { name: name || department.name, description, head: head || null },
            { new: true, runValidators: true }
        ).populate('head', 'firstName lastName designation');

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Check if employees are in this department
        const empCount = await Employee.countDocuments({ department: department.name });
        if (empCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${empCount} employee(s) are assigned to this department. Reassign them first.`,
            });
        }

        await Department.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartment,
    getDepartmentEmployees,
    updateDepartment,
    deleteDepartment,
};
