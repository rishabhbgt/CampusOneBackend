const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 15000,
            }
        );

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error(
            "❌ MongoDB Connection Failed:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;