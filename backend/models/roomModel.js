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
        roomMaintenance: {
            type: Boolean,
            required: false,
        },
        unavailableDates: [
            {
                start: { type: Date, required: true },
                end: { type: Date, required: true },
                roomAvailability: { type: Boolean, required: true, default: true }
            }
        ]
    },
    {
        timestamps: true,
    }
);

export const Room = mongoose.model('Room', roomSchema);