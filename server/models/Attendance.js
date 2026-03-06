const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Employee is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Half-Day', 'Late'],
            required: [true, 'Status is required'],
        },
        checkIn: {
            type: String,
            default: '',
        },
        checkOut: {
            type: String,
            default: '',
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one attendance record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
