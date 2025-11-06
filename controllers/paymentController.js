import Payment from "../models/Payment.js";

export const getAllPayment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      filter.category = { $regex: req.query.category, $option: "i" };
    }

    if (req.query.status) {
      filter.status = { $regex: req.query.status, $option: "i" };
    }

    const totalPayments = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPayments,
      totalPages: Math.ceil(totalPayments / limit),
      filter,
      payments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ success: true, payment });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid payment ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    const savedPayment = await newPayment.save();

    if (!savedPayment) {
      return res.status(400).json({ message: "Payment not created" });
    }

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: savedPayment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment by ID
export const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid payment ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete payment by ID
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment already deleted or not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid payment ID format",
      });
    }
    res.status(500).json({
      error: "Failed to delete payment",
    });
  }
};
