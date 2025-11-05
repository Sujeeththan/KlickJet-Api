import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Item name required"], trim: true },

    sku: {
      type: String,
      required: [true, "SKU required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price required"],
      min: [0, "Price cannot be negative"],
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    category: {
      type: String,
      default: null,
      trim: true,
    },

    createAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default mongoose.model("Item", itemSchema);
