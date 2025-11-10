// Role-based access control middleware
import { AppError } from "./errorHandler.js";

// Verify role - accepts single role or array of roles
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    // Flatten array in case nested arrays are passed
    const roles = allowedRoles.flat();

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(", ")}`,
          403
        )
      );
    }

    // For sellers, also check if they are approved (unless admin is accessing)
    if (req.user.role === "seller" && !req.user.isApproved && roles.includes("seller")) {
      return next(
        new AppError(
          "Your seller account is pending approval. Please wait for admin approval.",
          403
        )
      );
    }

    next();
  };
};

// Legacy export for backward compatibility
export const authorize = verifyRole;

// Admin only access (legacy - use verifyRole("admin") instead)
export const adminOnly = verifyRole("admin");

// Customer only access (legacy - use verifyRole("customer") instead)
export const customerOnly = verifyRole("customer");

// Seller only access - must be approved (legacy - use verifyRole("seller") instead)
export const sellerOnly = verifyRole("seller");

// Admin or approved seller access (legacy - use verifyRole("admin", "seller") instead)
export const adminOrApprovedSeller = verifyRole("admin", "seller");

