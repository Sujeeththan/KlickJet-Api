import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    delivered_date: {
      type: Date,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    deliverer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deliverer",
    },
    status: {
      type: String,
      enum: ["pending", "in_transit", "delivered", "cancelled"],
      default: "pending",
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
