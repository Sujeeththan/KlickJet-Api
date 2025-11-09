// Role-based access control middleware

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Admin only access
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

// Customer only access
export const customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  if (req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }

  next();
};

// Seller only access (must be approved)
export const sellerOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  if (req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Seller access required",
    });
  }

  // Check if seller is approved
  try {
    const Seller = (await import("../models/Seller.js")).default;
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending approval. Please wait for admin approval.",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your seller account is deactivated",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying seller status",
    });
  }
};

// Admin has full access, others need specific role
export const adminOrRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Admin has full access
    if (req.user.role === "admin") {
      return next();
    }

    // Check specific role
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role} or admin`,
      });
    }

    next();
  };
};

// Admin or approved seller access (for seller routes and order routes)
export const adminOrApprovedSeller = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  // Admin has full access
  if (req.user.role === "admin") {
    return next();
  }

  // Check if user is a seller
  if (req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or approved seller access required",
    });
  }

  // Check if seller is approved
  try {
    const Seller = (await import("../models/Seller.js")).default;
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending approval. Please wait for admin approval.",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your seller account is deactivated",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying seller status",
    });
  }
};

