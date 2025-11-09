import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user based on role
    let user;
    if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    } else if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id);
    } else if (decoded.role === "seller") {
      user = await Seller.findById(decoded.id);
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

