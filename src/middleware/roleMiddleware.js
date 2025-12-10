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

    console.log("🔍 Role Check - User Role:", req.user.role, "| Allowed Roles:", roles);

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      console.log("❌ Role check failed for user:", req.user.id);
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(", ")}`,
          403
        )
      );
    }

    console.log("✅ Role check passed for user:", req.user.id);

    // For sellers, also check if they are approved (unless admin is accessing)
    if (req.user.role === "seller" && !req.user.isApproved && roles.includes("seller")) {
      return next(
        new AppError(
          "Your seller account is pending approval. Please wait for admin approval.",
          403
        )
      );
    }

    // For deliverers, also check if they are approved (unless admin is accessing)
    if (req.user.role === "deliverer" && !req.user.isApproved && roles.includes("deliverer")) {
      return next(
        new AppError(
          "Your deliverer account is pending approval. Please wait for admin approval.",
          403
        )
      );
    }

    next();
  };
};


