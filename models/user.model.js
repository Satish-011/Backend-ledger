// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs import kiya

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

// Data save hone se THEEK PEHLE ye function chalega
userSchema.pre('save', async function() {
    // Agar password change nahi hua hai, toh aage badh jao
    if (!this.isModified('password')) return;

    // Password ko hash karna (10 rounds of encryption)
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);

module.exports = User;