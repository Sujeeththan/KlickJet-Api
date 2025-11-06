import mongoose from "mongoose";

const delivererSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone_no: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    vehicle_no: {
      type: String,
    },
    vehicle_type: {
      type: String,
    },
    address: {
      type: String,
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

export default mongoose.model("Deliverer", delivererSchema);
