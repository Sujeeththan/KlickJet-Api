import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Shop", shopSchema);
