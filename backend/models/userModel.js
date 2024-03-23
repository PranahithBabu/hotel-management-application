import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        confirmPassword: {
            type: String,
            required: true,
        },
        secretKey: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model('User', userSchema);