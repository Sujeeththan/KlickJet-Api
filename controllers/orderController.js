import Order from "../models/Order.js";

// Get all orders with pagination
export const getAllOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.deliverer) {
      filter.deliverer = { $regex: req.query.deliverer, $option: "i" };
    }

    if (req.query.customer) {
      filter.customer = { $regex: req.query.customer, $option: "i" };
    }

    if (req.query.item) {
      filter.item = { $regex: req.query.item, $option: "i" };
    }

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter).skip(skip).limit(limit);

    //  .populate('customer')
    //  .populate('deliverer')
    //  .populate('item')

    res.status(200).json({
      success: true,
      page,
      limit,
      message: "Order fetched successfully",
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      filter,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    if (!savedOrder) {
      return res.status(400).json({ message: "Order not created" });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order by ID
export const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findByIdAndUpdate(id, req.body, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete order by ID
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order already deleted or not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }
    res.status(500).json({
      error: "Failed to delete order",
    });
  }
};
