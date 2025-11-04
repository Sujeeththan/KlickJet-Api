import Item from "../models/Item.js";

// Get all items with pagination
export const getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await Item.countDocuments();
    const items = await Item.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      items,
    });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({  message: "Item not found" });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({  message: "Invalid item ID format" });
    }
    res.status(500).json({  error: error.message });
  }
};

// Create new item
export const createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();

    if (!savedItem) {
      return res.status(400).json({  message: "Item not created" });
    }

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: savedItem,
    });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
};

// Update item by ID
export const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findByIdAndUpdate(id, req.body, { new: true });

    if (!item) {
      return res.status(404).json({  message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({  message: "Invalid item ID format" });
    }
    res.status(500).json({  error: error.message });
  }
};

// Delete item by ID
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        
        message: "Item already deleted or not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        
        message: "Invalid item ID format",
      });
    }
    res.status(500).json({
      
      error: "Failed to delete item",
    });
  }
};
