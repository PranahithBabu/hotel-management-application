import mongoose from "mongoose";

const roomSchema = mongoose.Schema(
    {
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