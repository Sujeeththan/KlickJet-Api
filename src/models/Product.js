import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    instock: {
      type: Number,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: false, // Optional for backward compatibility
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;


