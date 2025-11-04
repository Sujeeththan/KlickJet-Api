import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
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
    
});

export default mongoose.model("User", userSchema);
