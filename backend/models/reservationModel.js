import mongoose, { mongo } from "mongoose";

const tomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}

const reservationSchema = new mongoose.Schema(
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
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: tomorrow,
        },
        status: {
            type: String,
            enum: ["pending","approved","rejected","canceled"],
            default: "pending"
        },
        price: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

reservationSchema.pre('save', async function(next) {
    if (!this.roomId) {
        try {
            const Room = mongoose.model('Room');
            const room = await Room.findOne().select('_id').exec();
            this.roomId = room._id;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

export const Reservation = mongoose.model('Reservation', reservationSchema);