const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    senderPersonName: {
        type:String
    },
    senderEmailId: {
        type:String
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
        type:String
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
});

module.exports = mongoose.model('Tickets',ticketSchema);