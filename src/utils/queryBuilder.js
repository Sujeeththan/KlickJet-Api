/**
 * Query Builder Utility
 *
 * Provides reusable functions for building MongoDB queries with:
 * - Server-side search across multiple fields
 * - Advanced filtering
 * - Sorting
 * - Pagination
 *
 * @module utils/queryBuilder
 */

/**
 * Builds a MongoDB query object with search, filters, and pagination
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.query - Express request query object
 * @param {Object} options.searchFields - Fields to search in (e.g., ['name', 'description'])
 * @param {Object} options.filterFields - Allowed filter fields and their types (e.g., { instock: 'boolean', price: 'number' })
 * @param {Object} options.defaultFilters - Default filters to always apply (e.g., { isActive: true })
 * @param {Object} options.roleBasedFilters - Filters based on user role (e.g., { seller: { seller_id: userId } })
 * @param {Object} options.user - Current user object (for role-based filtering)
 * @returns {Object} - Object containing filter, sort, pagination options
 *
 * @example
 * const { filter, sort, pagination } = buildQuery({
 *   query: req.query,
 *   searchFields: ['name', 'description'],
 *   filterFields: { instock: 'boolean', price: 'number', category: 'string' },
 *   defaultFilters: { isActive: true },
 *   roleBasedFilters: { seller: { seller_id: req.user.id } },
 *   user: req.user
 * });
 */
export const buildQuery = ({
  query = {},
  searchFields = [],
  filterFields = {},
  defaultFilters = {},
  roleBasedFilters = {},
  user = null,
}) => {
  const filter = { ...defaultFilters };

  // Apply role-based filters
  if (user && roleBasedFilters[user.role]) {
    Object.assign(filter, roleBasedFilters[user.role]);
  }

  // Handle search query - searches across multiple fields
  if (query.search && searchFields.length > 0) {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };

    if (searchFields.length === 1) {
      // Single field search
      filter[searchFields[0]] = searchRegex;
    } else {
      // Multi-field search using $or
      filter.$or = searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }
  }

  // Apply filters based on filterFields configuration
  Object.keys(filterFields).forEach((field) => {
    if (
      query[field] !== undefined &&
      query[field] !== null &&
      query[field] !== ""
    ) {
      const fieldType = filterFields[field];
      let value = query[field];

      // Type conversion and validation
      switch (fieldType) {
        case "boolean":
          if (value === "true" || value === true) {
            filter[field] = true;
          } else if (value === "false" || value === false) {
            filter[field] = false;
          }
          break;

        case "number":
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            filter[field] = numValue;
          }
          break;

        case "numberRange":
          // Handle range queries like price_min, price_max
          const minField = `${field}_min`;
          const maxField = `${field}_max`;
          const hasMin =
            query[minField] !== undefined &&
            query[minField] !== null &&
            query[minField] !== "";
          const hasMax =
            query[maxField] !== undefined &&
            query[maxField] !== null &&
            query[maxField] !== "";

          if (hasMin || hasMax) {
            filter[field] = {};
            if (hasMin) {
              const min = Number(query[minField]);
              if (!isNaN(min)) filter[field].$gte = min;
            }
            if (hasMax) {
              const max = Number(query[maxField]);
              if (!isNaN(max)) filter[field].$lte = max;
            }
          } else {
            // If no range specified, allow exact match
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              filter[field] = numValue;
            }
          }
          break;

        case "array":
          // Handle array filters (e.g., categories, tags)
          if (Array.isArray(value)) {
            filter[field] = { $in: value };
          } else if (typeof value === "string") {
            // Support comma-separated values
            const values = value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v);
            if (values.length > 0) {
              filter[field] = values.length === 1 ? values[0] : { $in: values };
            }
          } else {
            filter[field] = value;
          }
          break;

        case "objectId":
          // Handle MongoDB ObjectId fields
          if (typeof value === "string" && value.match(/^[0-9a-fA-F]{24}$/)) {
            filter[field] = value;
          }
          break;

        case "dateRange":
          // Handle date range queries
          const dateMinField = `${field}_from`;
          const dateMaxField = `${field}_to`;
          if (
            query[dateMinField] !== undefined ||
            query[dateMaxField] !== undefined
          ) {
            filter[field] = {};
            if (query[dateMinField] !== undefined) {
              const fromDate = new Date(query[dateMinField]);
              if (!isNaN(fromDate.getTime())) filter[field].$gte = fromDate;
            }
            if (query[dateMaxField] !== undefined) {
              const toDate = new Date(query[dateMaxField]);
              if (!isNaN(toDate.getTime())) {
                // Set to end of day
                toDate.setHours(23, 59, 59, 999);
                filter[field].$lte = toDate;
              }
            }
          }
          break;

        case "string":
        default:
          // String filter with case-insensitive regex
          if (typeof value === "string" && value.trim()) {
            filter[field] = { $regex: value.trim(), $options: "i" };
          } else {
            filter[field] = value;
          }
          break;
      }
    }
  });

  // Build sort object
  const sort = buildSort(query.sort, query.sortOrder);

  // Build pagination
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100 items per page
  const skip = (page - 1) * limit;

  return {
    filter,
    sort,
    pagination: {
      page,
      limit,
      skip,
    },
  };
};

/**
 * Builds a MongoDB sort object from query parameters
 *
 * @param {string} sortField - Field to sort by
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @param {Object} defaultSort - Default sort object if none provided
 * @returns {Object} - MongoDB sort object
 *
 * @example
 * buildSort('price', 'asc') // Returns { price: 1 }
 * buildSort('createdAt', 'desc') // Returns { createdAt: -1 }
 */
export const buildSort = (
  sortField,
  sortOrder,
  defaultSort = { createdAt: -1 }
) => {
  if (!sortField) {
    return defaultSort;
  }

  const order = sortOrder === "asc" ? 1 : -1;
  return { [sortField]: order };
};

/**
 * Builds pagination metadata for API responses
 *
 * @param {number} total - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

/**
 * Validates and sanitizes query parameters
 *
 * @param {Object} query - Query parameters
 * @param {Object} allowedParams - Allowed parameter names
 * @returns {Object} - Sanitized query object
 */
export const sanitizeQuery = (query, allowedParams = []) => {
  const sanitized = {};

  allowedParams.forEach((param) => {
    if (query[param] !== undefined) {
      sanitized[param] = query[param];
    }
  });

  return sanitized;
};
