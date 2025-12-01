import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Socket timeout to 45 seconds
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      bufferCommands: false, // Disable buffering, fail fast if not connected
    });
    isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error; // Re-throw to handle in app.js
  }
};

export default connectDB;
