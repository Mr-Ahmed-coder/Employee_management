const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Default annual leave allocation
const LEAVE_ALLOCATION = {
    Sick: 12,
    Casual: 12,
    Annual: 18,
    Unpaid: 999, // unlimited
};

// Helper: calculate business days between dates
const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
    }
    return count || 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { employee, leaveType, startDate, endDate, reason } = req.body;

        // Verify employee exists
        const emp = await Employee.findById(employee);
        if (!emp) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const days = calculateDays(startDate, endDate);

        // Check balance (skip for Unpaid)
        if (leaveType !== 'Unpaid') {
            const currentYear = new Date().getFullYear();
            const yearStart = new Date(currentYear, 0, 1);
            const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

            const usedLeaves = await Leave.aggregate([
                {
                    $match: {
                        employee: emp._id,
                        leaveType,
                        status: { $in: ['Approved', 'Pending'] },
                        startDate: { $gte: yearStart, $lte: yearEnd },
                    },
                },
                { $group: { _id: null, totalDays: { $sum: '$days' } } },
            ]);

            const used = usedLeaves.length > 0 ? usedLeaves[0].totalDays : 0;
            const allocation = LEAVE_ALLOCATION[leaveType] || 0;
            const remaining = allocation - used;

            if (days > remaining) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient ${leaveType} leave balance. Remaining: ${remaining} day(s), Requested: ${days} day(s)`,
                });
            }
        }

        // Check for overlapping leaves
        const overlap = await Leave.findOne({
            employee: emp._id,
            status: { $ne: 'Rejected' },
            $or: [
                { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
            ],
        });

        if (overlap) {
            return res.status(400).json({
                success: false,
                message: 'Leave dates overlap with an existing leave request',
            });
        }

        const leave = await Leave.create({
            employee: emp._id,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            appliedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Leave applied successfully',
            data: leave,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaveRequests = async (req, res) => {
    try {
        const { status, leaveType, employee } = req.query;
        let query = {};

        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;
        if (employee) query.employee = employee;

        // Employee role: only see own leaves
        if (req.user.role === 'Employee') {
            const emp = await Employee.findOne({ email: req.user.email });
            if (emp) {
                query.employee = emp._id;
            } else {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

        const leaves = await Leave.find(query)
            .populate('employee', 'firstName lastName department designation')
            .populate('reviewedBy', 'name')
            .populate('appliedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve or reject leave
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin, HR, Manager)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Leave has already been reviewed' });
        }

        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewNote = reviewNote || '';
        await leave.save();

        await leave.populate('employee', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: `Leave ${status.toLowerCase()} for ${leave.employee.firstName} ${leave.employee.lastName}`,
            data: leave,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave balance for an employee
// @route   GET /api/leaves/balance/:employeeId
// @access  Private
const getLeaveBalance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        const usedLeaves = await Leave.aggregate([
            {
                $match: {
                    employee: require('mongoose').Types.ObjectId.createFromHexString(employeeId),
                    status: { $in: ['Approved', 'Pending'] },
                    startDate: { $gte: yearStart, $lte: yearEnd },
                },
            },
            {
                $group: {
                    _id: '$leaveType',
                    used: { $sum: '$days' },
                },
            },
        ]);

        const balance = {};
        for (const type of ['Sick', 'Casual', 'Annual']) {
            const found = usedLeaves.find((l) => l._id === type);
            const used = found ? found.used : 0;
            balance[type] = {
                total: LEAVE_ALLOCATION[type],
                used,
                remaining: LEAVE_ALLOCATION[type] - used,
            };
        }

        res.status(200).json({
            success: true,
            year: currentYear,
            data: balance,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyLeave,
    getLeaveRequests,
    updateLeaveStatus,
    getLeaveBalance,
};
