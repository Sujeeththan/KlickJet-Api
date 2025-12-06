import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    title: {
      type: String,
      required: true,
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
  {
    _id: true,
    timestamps: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Update the updatedAt timestamp before saving
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Cart", cartSchema);
