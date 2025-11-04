import Customer from "../models/Customer.js";

// Get All Customers with Pagination
export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customers = await Customer.find().skip(skip).limit(limit);
    const totalCustomers = await Customer.countDocuments();

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      page,
      limit,
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      customers,
    });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
};

// Get Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({  message: "Customer Not Found" });
    }
    res.status(200).json({ success: true, customer });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({  message: "Invalid Customer ID Format" });
    }
    res.status(500).json({  error: error.message });
  }
};

// Create Customer
export const createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      success: true,
      message: "Customer Created Successfully",
      customer: savedCustomer,
    });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      return res.status(404).json({  message: "Customer Not Found" });
    }

    res.status(200).json({
      success: true,
      message: "Customer Updated Successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({  message: "Invalid Customer ID Format" });
    }
    res.status(500).json({  error: error.message });
  }
};

// Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        
        message: "Customer Not Found or Already Deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer Deleted Successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        
        message: "Invalid Customer ID Format",
      });
    }
    res.status(500).json({
      
      message: "Failed to Delete Customer",
      error: error.message,
    });
  }
};
