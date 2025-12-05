
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          // Simulate the error condition: accessing this.images when this is undefined
          // Note: In this script we are testing the FIX.
          // To reproduce the error, remove the `!this` check.
          if (!this || !this.images || this.images.length === 0) {
            return true;
          }
          return v < this.images.length;
        },
        message: 'Main image index must be within the images array bounds'
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
    }
  }
);

const Product = mongoose.model("Product", productSchema);

async function run() {
  try {
    // Simulate a context where `this` might be undefined in validator
    // This is hard to simulate exactly without DB, but we can test the validator function directly.
    
    const validator = productSchema.paths.mainImageIndex.validators[1].validator;
    
    console.log("Testing validator with undefined context...");
    try {
      const result = validator.call(undefined, 0);
      console.log("Validator result (undefined context):", result);
    } catch (e) {
      console.error("Validator crashed (undefined context):", e.message);
    }

    console.log("Testing validator with null context...");
    try {
      const result = validator.call(null, 0);
      console.log("Validator result (null context):", result);
    } catch (e) {
      console.error("Validator crashed (null context):", e.message);
    }
    
    console.log("Testing validator with valid context...");
    try {
      const context = { images: ['img1.jpg'] };
      const result = validator.call(context, 0);
      console.log("Validator result (valid context):", result);
    } catch (e) {
      console.error("Validator crashed (valid context):", e.message);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

run();
