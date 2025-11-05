import express from "express";
import connectDB from "./config/db.js";
import customerRouter from "./routes/customerRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import deliveryPersonRouter from "./routes/deliveryPersonRoutes.js";
import deliveryRouter from "./routes/deliveryRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";

const allowedOrigins = [];

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
  res.send("My project pos system working");
});
app.use("/api/user", userRouter);

const PORT = process.env.PORT;

connectDB();

app.use("/api/customers", customerRouter);
app.use("/api/items", itemRouter);
app.use("/api/users", authRoutes);
app.use("/api/deliveryPerson", deliveryPersonRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/order", orderRouter);
app.use("/api/shop", shopRouter);

app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`)
);
