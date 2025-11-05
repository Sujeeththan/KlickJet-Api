import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    totalSales: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
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

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
