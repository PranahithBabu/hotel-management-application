import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        roomNumber: {
            type: String,
            required: true,
        },
        roomType: {
            type: String,
            required: true,
        },
        roomPrice: {
            type: Number,
            required: true,
        },
        roomAvailability: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Room = mongoose.model('Room', roomSchema);