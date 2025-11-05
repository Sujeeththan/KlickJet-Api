import Deliverer from "../models/Deliverer.js";

//  Get All Deliverer with Pagination
export const getAllDeliverer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $option: "i" };
    }

    if (req.query.phone) {
      filter.phone = { $regex: req.query.phone, $option: "i" };
    }

    if (req.query.status) {
      filter.status = { $regex: req.query.status, $option: "i" };
    }

    const deliverer = await Deliverer.find(filter).skip(skip).limit(limit);
    const totalDeliverer = await Deliverer.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Deliverer fetched successfully",
      page,
      limit,
      totalDeliverer,
      totalPages: Math.ceil(totalDeliverer / limit),
      deliverer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Get Deliverer by ID
export const getDelivererById = async (req, res) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id);
    if (!deliverer) {
      return res
        .status(404)
        .json({ success: false, message: "Deliverer not found" });
    }
    res.status(200).json({ success: true, deliverer });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Deliverer ID Format" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Create Deliverer
export const createDeliverer = async (req, res) => {
  try {
    const newDeliverer = new Deliverer(req.body);
    const savedDeliverer = await newDeliverer.save();

    res.status(201).json({
      success: true,
      message: "Deliverer created successfully",
      deliverer: savedDeliverer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Update Deliverer
export const updateDeliverer = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedDeliverer = await Deliverer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDeliverer) {
      return res
        .status(404)
        .json({ success: false, message: "Deliverer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deliverer updated successfully",
      deliverer: updatedDeliverer,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Deliverer ID Format" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Delete Delivery Person
export const deleteDeliverer = async (req, res) => {
  try {
    const deliverer = await Deliverer.findByIdAndDelete(req.params.id);

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        message: "Deliverer not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deliverer deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Deliverer ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete deliverer",
      error: error.message,
    });
  }
};
