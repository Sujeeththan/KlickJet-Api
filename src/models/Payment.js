import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment_method: {
    type: String,
    enum: ["cash on delivery", "card", "online"],
    required: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  stripe_payment_intent: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);


