import mongoose from "mongoose";

const deliveryPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["available", "on-delivery", "inactive"],
    default: "available",
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

export default mongoose.model("DeliveryPerson", deliveryPersonSchema);
