import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username required"],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Invalid email"],
    },

    password: {
      type: String,
      required: [true, "Password required"],
    },

    role: {
      type: String,
      enum: ["admin", "cashier"],
      default: "cashier",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default mongoose.model("User", userSchema);
