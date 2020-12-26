const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    senderPersonName: {
        type:String
    },
    senderEmailId: {
        type:String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email']
    },
    senderDepartment: {
        type:String
    },
    senderCompany: {
        type:String
    },
    receiverPersonName: {
        type:String
    },
    receiverEmailId: {
        type:String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email']
    },
    receiverCompany: {
        type:String
    },
    receiverDepartment: {
        type:String
    },
    courierTrackingId: {
        type:String
    },
    courierCompany: {
        type:String
    },
    fileSendDate: {
        type:Date
    },
    QRCode:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{versionKey:false});

module.exports = mongoose.model('Tickets',ticketSchema);