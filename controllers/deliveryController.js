import Delivery from "../models/Delivery.js";

//  Get All Deliveries with Pagination
export const getAllDelivery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.customer) {
      filter.customer = { $regex: req.query.customer, $option: "i" };
    }

    if (req.query.deliverer) {
      filter.deliverer = { $regex: req.query.deliverer, $option: "i" };
    }

    if (req.query.status) {
      filter.status = { $regex: req.query.status, $option: "i" };
    }

    const deliveries = await Delivery.find(filter).skip(skip).limit(limit);
    const totalDeliveries = await Delivery.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Deliveries fetched successfully",
      page,
      limit,
      totalDeliveries,
      totalPages: Math.ceil(totalDeliveries / limit),
      filter,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get Delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery Not Found" });
    }
    res.status(200).json({ success: true, delivery });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Delivery ID Format" });
    }
    res.status(500).json({ error: error.message });
  }
};

//  Create Delivery
export const createDelivery = async (req, res) => {
  try {
    const newDelivery = new Delivery(req.body);
    const savedDelivery = await newDelivery.save();

    res.status(201).json({
      success: true,
      message: "Delivery Created Successfully",
      delivery: savedDelivery,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Update Delivery
export const updateDelivery = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedDelivery = await Delivery.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDelivery) {
      return res.status(404).json({ message: "Delivery Not Found" });
    }

    res.status(200).json({
      success: true,
      message: "Delivery Updated Successfully",
      delivery: updatedDelivery,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Delivery ID Format" });
    }
    res.status(500).json({ error: error.message });
  }
};

//  Delete Delivery
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery Not Found or Already Deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery Deleted Successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid Delivery ID Format",
      });
    }
    res.status(500).json({
      message: "Failed to Delete Delivery",
      error: error.message,
    });
  }
};
