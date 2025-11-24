# API Testing Guide - Search and Filtering

This guide provides comprehensive instructions for testing the enhanced search and filtering functionality in the KlickJet API.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Testing Products API](#testing-products-api)
4. [Testing Orders API](#testing-orders-api)
5. [Testing Reviews API](#testing-reviews-api)
6. [Testing Deliveries API](#testing-deliveries-api)
7. [Common Query Parameters](#common-query-parameters)
8. [Testing Scenarios](#testing-scenarios)
9. [Performance Testing](#performance-testing)

## Overview

The API now includes:
- **Server-side search** across multiple fields
- **Advanced filtering** with multiple filter types
- **Sorting** capabilities
- **Pagination** with metadata
- **Role-based filtering** (automatic based on user role)

## Prerequisites

1. **Start the server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

2. **Seed the database (optional, for testing):**
   ```bash
   npm run seed
   ```

3. **Get authentication token:**
   - Register/login to get a JWT token
   - Include token in requests: `Authorization: Bearer <token>`

4. **Tools for testing:**
   - Postman
   - cURL
   - Thunder Client (VS Code extension)
   - Any HTTP client

## Common Query Parameters

All list endpoints support these common parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search across configured fields | `?search=laptop` |
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |
| `sort` | string | Field to sort by | `?sort=price` |
| `sortOrder` | string | Sort order: `asc` or `desc` (default: `desc`) | `?sortOrder=asc` |

## Testing Products API

### Endpoint
```
GET /api/products
```

### Available Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `search` | string | Search in name and description | `?search=laptop` |
| `instock` | boolean | Filter by stock status | `?instock=true` |
| `price_min` | number | Minimum price | `?price_min=100` |
| `price_max` | number | Maximum price | `?price_max=500` |
| `discount_min` | number | Minimum discount percentage | `?discount_min=10` |
| `discount_max` | number | Maximum discount percentage | `?discount_max=50` |
| `seller_id` | ObjectId | Filter by seller | `?seller_id=507f1f77bcf86cd799439011` |

### Test Cases

#### 1. Basic Search
```bash
# Search for products containing "laptop"
GET /api/products?search=laptop

# Search for products containing "gaming" (case-insensitive)
GET /api/products?search=Gaming
```

#### 2. Filter by Stock Status
```bash
# Get only in-stock products
GET /api/products?instock=true

# Get only out-of-stock products
GET /api/products?instock=false
```

#### 3. Price Range Filtering
```bash
# Products between $100 and $500
GET /api/products?price_min=100&price_max=500

# Products above $200
GET /api/products?price_min=200

# Products below $1000
GET /api/products?price_max=1000
```

#### 4. Discount Range Filtering
```bash
# Products with 10-50% discount
GET /api/products?discount_min=10&discount_max=50

# Products with at least 20% discount
GET /api/products?discount_min=20
```

#### 5. Combined Search and Filters
```bash
# Search for "laptop" that are in stock and priced between $500-$1000
GET /api/products?search=laptop&instock=true&price_min=500&price_max=1000

# Search with discount filter
GET /api/products?search=gaming&discount_min=15&instock=true
```

#### 6. Sorting
```bash
# Sort by price (ascending)
GET /api/products?sort=price&sortOrder=asc

# Sort by price (descending)
GET /api/products?sort=price&sortOrder=desc

# Sort by creation date (newest first - default)
GET /api/products?sort=createdAt&sortOrder=desc
```

#### 7. Pagination
```bash
# Get first page (10 items)
GET /api/products?page=1&limit=10

# Get second page
GET /api/products?page=2&limit=10

# Get 20 items per page
GET /api/products?page=1&limit=20
```

#### 8. Complex Query
```bash
# Search, filter, sort, and paginate
GET /api/products?search=laptop&instock=true&price_min=500&price_max=2000&discount_min=10&sort=price&sortOrder=asc&page=1&limit=20
```

#### 9. Seller Role (Automatic Filtering)
```bash
# When authenticated as a seller, only their products are returned
# No need to specify seller_id filter
GET /api/products
# Headers: Authorization: Bearer <seller_token>
```

### Expected Response Format
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": false,
  "products": [...]
}
```

## Testing Orders API

### Endpoint
```
GET /api/orders
```
**Note:** Requires authentication

### Available Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `status` | string | Order status | `?status=pending` |
| `customer_id` | ObjectId | Filter by customer | `?customer_id=507f1f77bcf86cd799439011` |
| `product_id` | ObjectId | Filter by product | `?product_id=507f1f77bcf86cd799439011` |
| `total_amount_min` | number | Minimum order amount | `?total_amount_min=100` |
| `total_amount_max` | number | Maximum order amount | `?total_amount_max=500` |
| `order_date_from` | date | Orders from date | `?order_date_from=2024-01-01` |
| `order_date_to` | date | Orders to date | `?order_date_to=2024-12-31` |
| `quantity_min` | number | Minimum quantity | `?quantity_min=2` |
| `quantity_max` | number | Maximum quantity | `?quantity_max=10` |

### Test Cases

#### 1. Filter by Status
```bash
# Get pending orders
GET /api/orders?status=pending

# Get delivered orders
GET /api/orders?status=delivered
```

#### 2. Filter by Date Range
```bash
# Orders from January 2024
GET /api/orders?order_date_from=2024-01-01&order_date_to=2024-01-31

# Orders after a specific date
GET /api/orders?order_date_from=2024-06-01
```

#### 3. Filter by Amount Range
```bash
# Orders between $100 and $500
GET /api/orders?total_amount_min=100&total_amount_max=500
```

#### 4. Combined Filters
```bash
# Pending orders above $200 from last month
GET /api/orders?status=pending&total_amount_min=200&order_date_from=2024-11-01
```

#### 5. Role-Based Filtering

**As Customer:**
```bash
# Automatically shows only customer's orders
GET /api/orders
# Headers: Authorization: Bearer <customer_token>
```

**As Seller:**
```bash
# Automatically shows only orders for seller's products
GET /api/orders
# Headers: Authorization: Bearer <seller_token>
```

**As Admin:**
```bash
# Shows all orders
GET /api/orders
# Headers: Authorization: Bearer <admin_token>
```

## Testing Reviews API

### Endpoint
```
GET /api/reviews
```

### Available Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `search` | string | Search in comments | `?search=excellent` |
| `product_id` | ObjectId | Filter by product | `?product_id=507f1f77bcf86cd799439011` |
| `order_id` | ObjectId | Filter by order | `?order_id=507f1f77bcf86cd799439011` |
| `customer_id` | ObjectId | Filter by customer | `?customer_id=507f1f77bcf86cd799439011` |
| `rating_min` | number | Minimum rating (1-5) | `?rating_min=4` |
| `rating_max` | number | Maximum rating (1-5) | `?rating_max=5` |
| `my_reviews` | boolean | Get current customer's reviews | `?my_reviews=true` |

### Test Cases

#### 1. Search in Comments
```bash
# Search for reviews containing "excellent"
GET /api/reviews?search=excellent

# Search for reviews containing "good"
GET /api/reviews?search=good
```

#### 2. Filter by Product
```bash
# Get all reviews for a specific product
GET /api/reviews?product_id=507f1f77bcf86cd799439011
```

#### 3. Filter by Rating
```bash
# Get 5-star reviews only
GET /api/reviews?rating_min=5&rating_max=5

# Get reviews with 4 or 5 stars
GET /api/reviews?rating_min=4

# Get reviews between 3 and 4 stars
GET /api/reviews?rating_min=3&rating_max=4
```

#### 4. Get My Reviews (Customer)
```bash
# Get current customer's reviews
GET /api/reviews?my_reviews=true
# Headers: Authorization: Bearer <customer_token>
```

#### 5. Combined Search and Filters
```bash
# Search for "excellent" reviews with 5 stars for a specific product
GET /api/reviews?search=excellent&rating_min=5&product_id=507f1f77bcf86cd799439011
```

## Testing Deliveries API

### Endpoint
```
GET /api/deliveries
```
**Note:** Requires authentication

### Available Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `search` | string | Search in address | `?search=New York` |
| `status` | string | Delivery status | `?status=pending` |
| `order_id` | ObjectId | Filter by order | `?order_id=507f1f77bcf86cd799439011` |
| `deliverer_id` | ObjectId | Filter by deliverer | `?deliverer_id=507f1f77bcf86cd799439011` |
| `delivered_date_from` | date | Deliveries from date | `?delivered_date_from=2024-01-01` |
| `delivered_date_to` | date | Deliveries to date | `?delivered_date_to=2024-12-31` |

### Test Cases

#### 1. Search in Address
```bash
# Search for deliveries to "New York"
GET /api/deliveries?search=New York
# Headers: Authorization: Bearer <token>
```

#### 2. Filter by Status
```bash
# Get pending deliveries
GET /api/deliveries?status=pending

# Get delivered deliveries
GET /api/deliveries?status=delivered
```

#### 3. Filter by Date Range
```bash
# Deliveries delivered in January 2024
GET /api/deliveries?delivered_date_from=2024-01-01&delivered_date_to=2024-01-31
```

#### 4. Role-Based Filtering

**As Customer:**
```bash
# Automatically shows only deliveries for customer's orders
GET /api/deliveries
# Headers: Authorization: Bearer <customer_token>
```

**As Seller:**
```bash
# Automatically shows only deliveries for seller's product orders
GET /api/deliveries
# Headers: Authorization: Bearer <seller_token>
```

**As Deliverer:**
```bash
# Automatically shows only deliverer's own deliveries
GET /api/deliveries
# Headers: Authorization: Bearer <deliverer_token>
```

## Testing Scenarios

### Scenario 1: E-commerce Product Search
**Goal:** Find gaming laptops under $1500 with at least 10% discount

```bash
GET /api/products?search=gaming%20laptop&price_max=1500&discount_min=10&instock=true&sort=price&sortOrder=asc
```

### Scenario 2: Customer Order History
**Goal:** Customer wants to see their pending orders from last month

```bash
GET /api/orders?status=pending&order_date_from=2024-11-01&order_date_to=2024-11-30
# Headers: Authorization: Bearer <customer_token>
```

### Scenario 3: Product Reviews Analysis
**Goal:** Find all 5-star reviews for a product containing "excellent"

```bash
GET /api/reviews?product_id=507f1f77bcf86cd799439011&rating_min=5&search=excellent
```

### Scenario 4: Seller Performance
**Goal:** Seller wants to see all orders for their products above $100

```bash
GET /api/orders?total_amount_min=100
# Headers: Authorization: Bearer <seller_token>
# Note: Automatically filtered to seller's products
```

### Scenario 5: Delivery Tracking
**Goal:** Deliverer wants to see their pending deliveries

```bash
GET /api/deliveries?status=pending
# Headers: Authorization: Bearer <deliverer_token>
# Note: Automatically filtered to deliverer's deliveries
```

## Performance Testing

### Test Large Datasets

1. **Test pagination with large result sets:**
   ```bash
   # Test with 1000+ products
   GET /api/products?page=1&limit=50
   GET /api/products?page=20&limit=50
   ```

2. **Test search performance:**
   ```bash
   # Search across large dataset
   GET /api/products?search=test&page=1&limit=10
   ```

3. **Test complex queries:**
   ```bash
   # Multiple filters + search + sort
   GET /api/products?search=laptop&instock=true&price_min=100&price_max=2000&discount_min=5&sort=price&sortOrder=asc&page=1&limit=20
   ```

### Expected Performance

- **Response time:** < 500ms for typical queries
- **Pagination:** Should work correctly even with 10,000+ records
- **Search:** Should be efficient with MongoDB indexes (consider adding indexes for frequently searched fields)

## Error Handling

### Invalid Parameters
```bash
# Invalid page number (should default to 1)
GET /api/products?page=0

# Invalid limit (should default to 10, max 100)
GET /api/products?limit=200

# Invalid sort field (should use default sort)
GET /api/products?sort=invalidField
```

### Missing Data
```bash
# Search with no results
GET /api/products?search=nonexistentproduct12345

# Filter with no matches
GET /api/products?price_min=999999
```

## Tips for Testing

1. **Use Postman Collections:** Create a collection with all test cases
2. **Test Edge Cases:** Empty strings, special characters, very large numbers
3. **Test Role-Based Access:** Verify users only see their own data
4. **Test Pagination Boundaries:** First page, last page, page beyond total
5. **Test Combined Filters:** Ensure multiple filters work together correctly
6. **Monitor Response Times:** Check performance with realistic data volumes

## Troubleshooting

### Issue: Search not returning expected results
- **Check:** Ensure search term matches field content (case-insensitive)
- **Check:** Verify search fields are configured correctly in controller

### Issue: Filters not working
- **Check:** Verify filter parameter names match exactly
- **Check:** Ensure filter values are correct type (boolean, number, etc.)

### Issue: Pagination showing wrong data
- **Check:** Verify page and limit parameters
- **Check:** Ensure total count matches filtered results

### Issue: Role-based filtering not working
- **Check:** Verify authentication token is valid
- **Check:** Verify user role in token matches expected role

## Additional Notes

- All search is **case-insensitive**
- All date filters use **ISO 8601 format** (YYYY-MM-DD)
- Maximum items per page is **100** (for performance)
- Default sort is by **createdAt descending** (newest first)
- Empty search strings are ignored
- Invalid filter values are ignored (with defaults applied)

---

**Last Updated:** 2024
**API Version:** 1.0.0

