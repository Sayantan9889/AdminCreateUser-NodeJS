const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    image: {
        type: String
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (email) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email),
            message: 'Please enter a valid email address.',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR', 'TL'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model('user', userSchema)