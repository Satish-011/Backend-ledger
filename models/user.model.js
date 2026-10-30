// models/User.js
const mongoose = require('mongoose');

// 1. Schema define karna (Data kaisa dikhega)
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true // Ye field zaroori hai
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Ek email se ek hi account banega
    },
    password: { 
        type: String, 
        required: true 
    }
}, { timestamps: true }); 
// timestamps: true likhne se MongoDB automatically 'createdAt' aur 'updatedAt' time save kar lega.

// 2. Model banakar export karna
const User = mongoose.model('User', userSchema);

module.exports = User;