import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment_method: {
    type: String,
    enum: ["cash on delivery", "cart"],
    required: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);


