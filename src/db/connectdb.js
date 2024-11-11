import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = 'mongodb://localhost:27017/myDatabase';
        const options = {
            useNewUrlParser: true,
        };
        await mongoose.connect(uri, options);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
