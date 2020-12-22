const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    companyName: {
        type: String,
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email']
    },
    password: {
        type:String,
        select:false
    },
    licenseNo: {
        type: String
    },
    licenseKey: {
        secretKey: {
            type:String
        },
        iv: { 
            type:String
        },
        content: {
            type:String
        }
    },
    option: {
        type:String
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{versionKey:false});

module.exports = mongoose.model('User',userSchema);