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
     images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed per product'
    }
  },
  mainImageIndex: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        // Allow mainImageIndex when images array is empty or when index is within bounds
        // Check if this is defined and has images to avoid runtime errors
        if (!this || !this.images || this.images.length === 0) {
          return true;
        }
        return v < this.images.length;
      },
      message: 'Main image index must be within the images array bounds'
    }
  },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;


