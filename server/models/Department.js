const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            unique: true,
            trim: true,
            maxlength: [100, 'Department name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Department', departmentSchema);
