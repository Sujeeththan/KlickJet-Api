import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    deliverer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deliverer",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryDate: {
      type: Date,
      default: null,
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

export default mongoose.model("Delivery", deliverySchema);
