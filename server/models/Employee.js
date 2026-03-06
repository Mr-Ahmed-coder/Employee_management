const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        // Personal Information
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        address: {
            street: { type: String, trim: true, default: '' },
            city: { type: String, trim: true, default: '' },
            state: { type: String, trim: true, default: '' },
            zipCode: { type: String, trim: true, default: '' },
            country: { type: String, trim: true, default: '' },
        },

        // Job Information
        designation: {
            type: String,
            required: [true, 'Designation is required'],
            trim: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        joiningDate: {
            type: Date,
            required: [true, 'Joining date is required'],
        },
        salary: {
            type: Number,
            required: [true, 'Salary is required'],
            min: [0, 'Salary cannot be negative'],
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },

        // Meta
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
