import express from "express";
import connectDB from "./src/config/db.js";
import cors from "cors";
import { errorHandler, notFound } from "./src/middleware/errorHandler.js";

// Import routes
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
import customerRouter from "./src/routes/customerRoutes.js";
import sellerRouter from "./src/routes/sellerRoutes.js";
import delivererRouter from "./src/routes/delivererRoutes.js";
import productRouter from "./src/routes/productRoutes.js";
import orderRouter from "./src/routes/orderRoutes.js";
import reviewRouter from "./src/routes/reviewRoutes.js";
import deliveryRouter from "./src/routes/deliveryRoutes.js";
import paymentRouter from "./src/routes/paymentRoutes.js";
import categoryRouter from "./src/routes/categoryRoutes.js";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://127.0.0.1:3000",
  "https://klick-jet-api.vercel.app"
];

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && !origin.includes('localhost')) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

app.get("/", (req, res) => {
  res.send("KlickJet Server is running");
});

const PORT = process.env.PORT || 5000;

connectDB();

// Authentication routes
app.use("/api/auth", authRouter);

// User management routes (admin only - for creating admin users)
app.use("/api/users", userRouter);

// Admin routes (approval actions)
app.use("/api/admin", adminRouter);

// Entity routes
app.use("/api/customers", customerRouter);
app.use("/api/sellers", sellerRouter);
app.use("/api/deliverers", delivererRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/deliveries", deliveryRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/categories", categoryRouter);

// 404 Handler - must be after all routes
app.use(notFound);

// Global Error Handler - must be last
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`)
);
