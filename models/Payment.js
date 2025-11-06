import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment_method: {
    type: String,
    enum: ["cash", "credit_card", "online", "upi"],
    required: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
});

export default mongoose.model("Payment", paymentSchema);
