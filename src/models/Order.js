import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number, // Storing price at time of order is good practice
          required: true, 
        }
      }
    ],
    total_amount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String, // Can store as formatted string or object. Frontend sends string.
      required: true,
    },
    contactInfo: {
        firstName: String,
        lastName: String,
        phone: String
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Switched to timestamps: true for auto createdAt/updatedAt
    versionKey: false,
  }
);

export default mongoose.model("Order", orderSchema);


