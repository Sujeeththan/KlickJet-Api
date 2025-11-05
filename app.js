import express from "express";
import connectDB from "./config/db.js";
import customerRouter from "./routes/customerRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import deliveryRouter from "./routes/deliveryRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import delivererRouter from "./routes/delivererRoutes.js";

const allowedOrigins = [];

const app = express();
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
  res.send("My project pos system working");
});
app.use("/api/user", userRouter);

const PORT = process.env.PORT;

connectDB();

app.use("/api/customers", customerRouter);
app.use("/api/items", itemRouter);
app.use("/api/users", userRouter);
app.use("/api/deliverer", delivererRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/order", orderRouter);
app.use("/api/seller", sellerRouter);

app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`)
);
