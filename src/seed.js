import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

// Ensure we're in development (check NODE_ENV or default to development if not set)
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
  console.error(" Seeding is only allowed in development environment");
  console.error(" Current NODE_ENV:", nodeEnv);
  process.exit(1);
}

// Hash password helper (since we're bypassing the pre-save hook for seeding)
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Sample data
const sampleData = {
  admin: {
    name: "Admin User",
    email: "admin@klickjet.com",
    password: "Admin@123",
    role: "admin",
    isActive: true,
  },
};

const seedDatabase = async () => {
  try {
    console.log(" Starting database seeding...\n");

    // Connect to database
    await connectDB();
    console.log(" Connected to MongoDB\n");

    // Clear existing data
    console.log("  Clearing existing data...");
    await User.deleteMany({});
    console.log(" Users collections cleared\n");

    // Seed Admin User
    console.log(" Seeding Admin User...");
    const adminPassword = await hashPassword(sampleData.admin.password);
    const adminUser = await User.create({
      ...sampleData.admin,
      password: adminPassword,
    });
    console.log(` Admin created: ${adminUser.email} (ID: ${adminUser._id})\n`);

    // Close database connection
    await mongoose.connection.close();
    console.log(" Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding database:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
