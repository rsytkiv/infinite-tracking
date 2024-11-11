import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    settings: {
        pumpsAndDumps: {
            type: Object,
            default: {
                isEnabled: false,
                exchanges: ["binance", "bybit"],
                percentage: 10,
            },
        },
    },
});

// Create the user model
export const User = mongoose.model('User', userSchema);
