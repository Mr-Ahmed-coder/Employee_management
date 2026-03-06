const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Mark attendance for a single employee
// @route   POST /api/attendance
// @access  Private (Admin, HR, Manager)
const markAttendance = async (req, res) => {
    try {
        const { employee, date, status, checkIn, checkOut } = req.body;

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if already marked
        const existing = await Attendance.findOne({ employee, date: attendanceDate });
        if (existing) {
            // Update existing record
            existing.status = status;
            existing.checkIn = checkIn || existing.checkIn;
            existing.checkOut = checkOut || existing.checkOut;
            existing.markedBy = req.user._id;
            await existing.save();

            return res.status(200).json({
                success: true,
                message: 'Attendance updated',
                data: existing,
            });
        }

        const attendance = await Attendance.create({
            employee,
            date: attendanceDate,
            status,
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            markedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Attendance marked',
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Admin, HR, Manager)
const bulkMarkAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;
        // records = [{ employee, status, checkIn, checkOut }, ...]

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const results = [];

        for (const record of records) {
            const existing = await Attendance.findOne({
                employee: record.employee,
                date: attendanceDate,
            });

            if (existing) {
                existing.status = record.status;
                existing.checkIn = record.checkIn || existing.checkIn;
                existing.checkOut = record.checkOut || existing.checkOut;
                existing.markedBy = req.user._id;
                await existing.save();
                results.push(existing);
            } else {
                const attendance = await Attendance.create({
                    employee: record.employee,
                    date: attendanceDate,
                    status: record.status,
                    checkIn: record.checkIn || '',
                    checkOut: record.checkOut || '',
                    markedBy: req.user._id,
                });
                results.push(attendance);
            }
        }

        res.status(200).json({
            success: true,
            message: `Attendance marked for ${results.length} employees`,
            data: results,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendanceRecords = async (req, res) => {
    try {
        const { startDate, endDate, employee, status } = req.query;
        let query = {};

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Employee filter
        if (employee) {
            query.employee = employee;
        }

        // For Employee role, only show their own attendance
        if (req.user.role === 'Employee') {
            const emp = await Employee.findOne({ email: req.user.email });
            if (emp) {
                query.employee = emp._id;
            } else {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        const records = await Attendance.find(query)
            .populate('employee', 'firstName lastName department designation')
            .populate('markedBy', 'name')
            .sort({ date: -1, 'employee.firstName': 1 });

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance for a specific date (for marking page)
// @route   GET /api/attendance/date/:date
// @access  Private (Admin, HR, Manager)
const getAttendanceByDate = async (req, res) => {
    try {
        const attendanceDate = new Date(req.params.date);
        attendanceDate.setHours(0, 0, 0, 0);

        const records = await Attendance.find({ date: attendanceDate })
            .populate('employee', 'firstName lastName department designation');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get monthly attendance report
// @route   GET /api/attendance/report/monthly
// @access  Private (Admin, HR, Manager)
const getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59, 999);

        // Get all active employees
        const employees = await Employee.find({ status: 'Active' })
            .select('firstName lastName department designation')
            .sort({ firstName: 1 });

        // Get attendance records for the month
        const records = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
        });

        // Build report
        const report = employees.map((emp) => {
            const empRecords = records.filter(
                (r) => r.employee.toString() === emp._id.toString()
            );

            const stats = {
                present: empRecords.filter((r) => r.status === 'Present').length,
                absent: empRecords.filter((r) => r.status === 'Absent').length,
                halfDay: empRecords.filter((r) => r.status === 'Half-Day').length,
                late: empRecords.filter((r) => r.status === 'Late').length,
                total: empRecords.length,
            };

            return {
                employee: emp,
                stats,
            };
        });

        // Calculate working days in month
        const totalDays = new Date(y, m, 0).getDate();

        res.status(200).json({
            success: true,
            month: m,
            year: y,
            totalDays,
            data: report,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    markAttendance,
    bulkMarkAttendance,
    getAttendanceRecords,
    getAttendanceByDate,
    getMonthlyReport,
};
