const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Employee is required'],
        },
        leaveType: {
            type: String,
            enum: ['Sick', 'Casual', 'Annual', 'Unpaid'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        days: {
            type: Number,
            required: true,
            min: [0.5, 'Minimum leave is half day'],
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewNote: {
            type: String,
            trim: true,
            default: '',
        },
        appliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Leave', leaveSchema);
