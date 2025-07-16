const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    room_number: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    exptra_bed: {
        type: Boolean,
        default: false
    },  
    is_reserved: {
        type: Boolean,
        default: false
    },
    status:{
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    description: {
        type: String,
        required: false
    },
    images: [{
        type: String,
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
