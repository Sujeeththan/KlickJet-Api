import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Import routes
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import delivererRouter from "./routes/delivererRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import productRouter from "./routes/productRoutes.js";
import deliveryRouter from "./routes/deliveryRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

const allowedOrigins = [];

const app = express();
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
  res.send("My project final project system working");
});

const PORT = process.env.PORT;

connectDB();

// Authentication routes - Unified system
// Register and login at /api/users
app.use("/api/users", authRouter);
// Protected routes and admin functions at /api/auth (backward compatibility)
app.use("/api/auth", authRouter);

// Entity routes
app.use("/api/admin/users", userRouter); // User management routes (admin only)
app.use("/api/admin", adminRouter);
app.use("/api/sellers", sellerRouter);
app.use("/api/customers", customerRouter);
app.use("/api/deliverers", delivererRouter);
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);
app.use("/api/deliveries", deliveryRouter);
app.use("/api/payments", paymentRouter);

// 404 Handler - must be after all routes
app.use(notFound);

// Global Error Handler - must be last
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`)
);
