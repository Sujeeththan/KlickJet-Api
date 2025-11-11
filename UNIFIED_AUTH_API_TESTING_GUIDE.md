# Unified Authentication API Testing Guide

Complete step-by-step guide for testing the centralized authentication system.

## 📋 Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Unified Registration](#unified-registration)
- [Unified Login](#unified-login)
- [Role-Based Testing](#role-based-testing)
- [Error Handling & Validation](#error-handling--validation)
- [Complete Workflows](#complete-workflows)
- [Troubleshooting](#troubleshooting)

---

## Overview

The authentication system has been centralized into two main endpoints:

### Main Endpoints
- **Registration**: `POST /api/users/register`
- **Login**: `POST /api/users/login`

### Supported Roles
- `admin` - System administrators
- `seller` - Product sellers (requires admin approval)
- `customer` - Regular customers

### Backward Compatibility
- Old routes still work via `/api/auth/*` for protected routes (me, logout, seller approval)

---

## Setup

### 1. Install Thunder Client
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Thunder Client"
- Install the extension

### 2. Start Your Server
```bash
npm run dev
# or
node app.js
```

### 3. Configure Base URL
- Base URL: `http://localhost:PORT` (e.g., `http://localhost:5000`)

### 4. Set Up Environment Variables
Create environment variables in Thunder Client:
- `baseUrl`: `http://localhost:5000`
- `adminToken`: (set after admin login)
- `sellerToken`: (set after seller login)
- `customerToken`: (set after customer login)

---

## Unified Registration

### Endpoint
```
POST /api/users/register
```

### Common Request Structure
```json
{
  "role": "admin|seller|customer",
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone_no": "1234567890",  // Required for seller and customer
  "address": "User Address",  // Required for seller, optional for customer
  "shopName": "Shop Name"     // Required only for seller
}
```

---

## Admin Registration

### Step 1: Register Admin
**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "role": "admin",
  "name": "Admin User",
  "email": "admin@klickjet.com",
  "password": "admin123456"
}
```

**Required Fields:**
- `role`: "admin"
- `name`: String (2-50 characters)
- `email`: Valid email address
- `password`: String (minimum 8 characters)

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@klickjet.com",
    "role": "admin"
  }
}
```

**Action:** Copy the `token` and save it as `adminToken`.

---

## Seller Registration

### Step 1: Register Seller
**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "role": "seller",
  "name": "Jane Seller",
  "shopName": "Jane's Electronics",
  "email": "seller@example.com",
  "password": "seller123456",
  "phone_no": "9876543210",
  "address": "456 Market Street"
}
```

**Required Fields:**
- `role`: "seller"
- `name`: String (2-50 characters)
- `shopName`: String (2-100 characters)
- `email`: Valid email address
- `password`: String (minimum 8 characters)
- `phone_no`: String (10-15 digits)
- `address`: String (non-empty)

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Seller registration successful. Your account is pending admin approval.",
  "user": {
    "id": "...",
    "name": "Jane Seller",
    "shopName": "Jane's Electronics",
    "email": "seller@example.com",
    "role": "seller",
    "status": "pending"
  }
}
```

**Note:** 
- Seller receives NO token on registration
- Seller must wait for admin approval before login
- Status is automatically set to "pending"

**Action:** Save the seller `id` for admin approval.

---

## Customer Registration

### Step 1: Register Customer
**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "role": "customer",
  "name": "John Customer",
  "email": "customer@example.com",
  "password": "customer123456",
  "phone_no": "1234567890",
  "address": "123 Customer Street"
}
```

**Required Fields:**
- `role`: "customer"
- `name`: String (2-50 characters)
- `email`: Valid email address
- `password`: String (minimum 8 characters)
- `phone_no`: String (10-15 digits)
- `address`: String (optional, can be empty)

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Customer",
    "email": "customer@example.com",
    "role": "customer",
    "phone_no": "1234567890",
    "address": "123 Customer Street"
  }
}
```

**Action:** Copy the `token` and save it as `customerToken`.

---

## Unified Login

### Endpoint
```
POST /api/users/login
```

### Request Structure
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "admin|seller|customer"  // Optional, but recommended
}
```

---

## Admin Login

### Step 1: Login as Admin
**Endpoint:** `POST /api/users/login`

**Request Body (With Role):**
```json
{
  "email": "admin@klickjet.com",
  "password": "admin123456",
  "role": "admin"
}
```

**Request Body (Without Role - Auto-detect):**
```json
{
  "email": "admin@klickjet.com",
  "password": "admin123456"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@klickjet.com",
    "role": "admin"
  }
}
```

**Action:** Update `adminToken` with the new token.

---

## Seller Login

### Step 1: Login as Seller (After Admin Approval)
**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "seller@example.com",
  "password": "seller123456",
  "role": "seller"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Seller logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Jane Seller",
    "email": "seller@example.com",
    "role": "seller",
    "shopName": "Jane's Electronics",
    "phone_no": "9876543210",
    "address": "456 Market Street",
    "status": "approved"
  }
}
```

**Action:** Copy the `token` and save it as `sellerToken`.

**Error Response (If Not Approved):** 403 Forbidden
```json
{
  "success": false,
  "message": "Your seller account is pending admin approval. Please wait for approval"
}
```

---

## Customer Login

### Step 1: Login as Customer
**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "customer123456",
  "role": "customer"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Customer logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Customer",
    "email": "customer@example.com",
    "role": "customer",
    "phone_no": "1234567890",
    "address": "123 Customer Street"
  }
}
```

**Action:** Update `customerToken` with the new token.

---

## Error Handling & Validation

### Registration Validation Errors

#### 1. Missing Role
**Request:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Role is required. Must be one of: admin, seller, customer"
}
```

#### 2. Invalid Role
**Request:**
```json
{
  "role": "invalid_role",
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid role. Must be one of: admin, seller, customer"
}
```

#### 3. Missing Required Fields
**Request (Seller without shopName):**
```json
{
  "role": "seller",
  "name": "Test Seller",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "1234567890",
  "address": "123 Street"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Shop name is required for sellers"
}
```

#### 4. Invalid Email Format
**Request:**
```json
{
  "role": "customer",
  "name": "Test User",
  "email": "invalid-email",
  "password": "password123",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

#### 5. Password Too Short
**Request:**
```json
{
  "role": "customer",
  "name": "Test User",
  "email": "test@example.com",
  "password": "short",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

#### 6. Invalid Phone Number
**Request:**
```json
{
  "role": "customer",
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "123"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide a valid phone number (10-15 digits)"
}
```

#### 7. Name Too Short
**Request:**
```json
{
  "role": "customer",
  "name": "A",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Name must be at least 2 characters long"
}
```

#### 8. Name Too Long
**Request:**
```json
{
  "role": "customer",
  "name": "This is a very long name that exceeds fifty characters limit",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Name cannot exceed 50 characters"
}
```

#### 9. Shop Name Validation (Seller)
**Request (Shop name too short):**
```json
{
  "role": "seller",
  "name": "Test Seller",
  "shopName": "A",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "1234567890",
  "address": "123 Street"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Shop name must be at least 2 characters long"
}
```

#### 10. Missing Address (Seller)
**Request:**
```json
{
  "role": "seller",
  "name": "Test Seller",
  "shopName": "Test Shop",
  "email": "test@example.com",
  "password": "password123",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Address is required for sellers"
}
```

#### 11. Email Already Registered
**Request:**
```json
{
  "role": "customer",
  "name": "Test User",
  "email": "existing@example.com",
  "password": "password123",
  "phone_no": "1234567890"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Email already registered. Please use a different email address"
}
```

#### 12. Multiple Validation Errors
**Request:**
```json
{
  "role": "seller",
  "name": "A",
  "email": "invalid-email",
  "password": "short"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Name must be at least 2 characters long. Please provide a valid email address. Password must be at least 8 characters long. Shop name is required for sellers. Phone number is required for sellers. Address is required for sellers"
}
```

---

### Login Validation Errors

#### 1. Missing Email
**Request:**
```json
{
  "password": "password123"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Email is required"
}
```

#### 2. Missing Password
**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Password is required"
}
```

#### 3. Invalid Email Format
**Request:**
```json
{
  "email": "invalid-email",
  "password": "password123"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

#### 4. Invalid Credentials
**Request:**
```json
{
  "email": "nonexistent@example.com",
  "password": "wrongpassword"
}
```

**Response:** 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 5. Account Deactivated
**Response:** 401 Unauthorized
```json
{
  "success": false,
  "message": "Account is deactivated. Please contact administrator"
}
```

#### 6. Seller Not Approved
**Request:**
```json
{
  "email": "pending-seller@example.com",
  "password": "password123",
  "role": "seller"
}
```

**Response:** 403 Forbidden
```json
{
  "success": false,
  "message": "Your seller account is pending admin approval. Please wait for approval"
}
```

#### 7. Invalid Role
**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "role": "invalid_role"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid role. Must be one of: admin, seller, customer"
}
```

---

## Role-Based Testing

### Complete Admin Workflow

#### Step 1: Register Admin
```
POST /api/users/register
{
  "role": "admin",
  "name": "Admin User",
  "email": "admin@klickjet.com",
  "password": "admin123456"
}
```

#### Step 2: Login Admin
```
POST /api/users/login
{
  "email": "admin@klickjet.com",
  "password": "admin123456",
  "role": "admin"
}
```

#### Step 3: Get Current User
```
GET /api/auth/me
Authorization: Bearer {{adminToken}}
```

#### Step 4: Get Pending Sellers
```
GET /api/auth/sellers/pending
Authorization: Bearer {{adminToken}}
```

#### Step 5: Approve Seller
```
PUT /api/auth/seller/approve/:id
Authorization: Bearer {{adminToken}}
```

#### Step 6: Logout
```
POST /api/auth/logout
Authorization: Bearer {{adminToken}}
```

---

### Complete Seller Workflow

#### Step 1: Register Seller
```
POST /api/users/register
{
  "role": "seller",
  "name": "Jane Seller",
  "shopName": "Jane's Electronics",
  "email": "seller@example.com",
  "password": "seller123456",
  "phone_no": "9876543210",
  "address": "456 Market Street"
}
```

#### Step 2: Wait for Admin Approval
- Admin must approve the seller using: `PUT /api/auth/seller/approve/:id`

#### Step 3: Login Seller (After Approval)
```
POST /api/users/login
{
  "email": "seller@example.com",
  "password": "seller123456",
  "role": "seller"
}
```

#### Step 4: Get Current User
```
GET /api/auth/me
Authorization: Bearer {{sellerToken}}
```

#### Step 5: Create Product
```
POST /api/products
Authorization: Bearer {{sellerToken}}
{
  "name": "Product Name",
  "price": 99.99,
  "instock": true
}
```

#### Step 6: Logout
```
POST /api/auth/logout
Authorization: Bearer {{sellerToken}}
```

---

### Complete Customer Workflow

#### Step 1: Register Customer
```
POST /api/users/register
{
  "role": "customer",
  "name": "John Customer",
  "email": "customer@example.com",
  "password": "customer123456",
  "phone_no": "1234567890",
  "address": "123 Customer Street"
}
```

#### Step 2: Login Customer
```
POST /api/users/login
{
  "email": "customer@example.com",
  "password": "customer123456",
  "role": "customer"
}
```

#### Step 3: Get Current User
```
GET /api/auth/me
Authorization: Bearer {{customerToken}}
```

#### Step 4: Browse Products
```
GET /api/products
```

#### Step 5: Create Order
```
POST /api/orders
Authorization: Bearer {{customerToken}}
{
  "product_id": "product_id_here",
  "quantity": 2
}
```

#### Step 6: Create Payment
```
POST /api/payments
Authorization: Bearer {{customerToken}}
{
  "order_id": "order_id_here",
  "payment_method": "credit_card"
}
```

#### Step 7: Logout
```
POST /api/auth/logout
Authorization: Bearer {{customerToken}}
```

---

## Complete Workflows

### End-to-End E-Commerce Flow

#### 1. Admin Setup
```
POST /api/users/register (admin)
POST /api/users/login (admin)
```

#### 2. Seller Registration & Approval
```
POST /api/users/register (seller)
GET /api/auth/sellers/pending (admin)
PUT /api/auth/seller/approve/:id (admin)
POST /api/users/login (seller)
```

#### 3. Customer Registration
```
POST /api/users/register (customer)
POST /api/users/login (customer)
```

#### 4. Product Creation
```
POST /api/products (seller)
```

#### 5. Order & Payment
```
POST /api/orders (customer)
POST /api/payments (customer)
```

---

## Testing Scenarios

### Scenario 1: Register All Roles
1. Register Admin → Get token immediately
2. Register Seller → No token, pending approval
3. Register Customer → Get token immediately

### Scenario 2: Seller Approval Flow
1. Register Seller → Status: "pending"
2. Admin approves seller → Status: "approved"
3. Seller logs in → Get token

### Scenario 3: Login Without Role
1. Login with email/password only → System auto-detects role
2. System searches: User → Customer → Seller

### Scenario 4: Login With Wrong Role
1. Register as Customer
2. Try to login with role: "seller" → Error: User not found in seller model
3. Login with role: "customer" → Success

### Scenario 5: Validation Testing
1. Test all validation errors
2. Test multiple errors at once
3. Test field-specific errors

---

## Troubleshooting

### Common Issues

#### 1. "Role is required"
**Cause:** Missing `role` field in registration
**Solution:** Include `role` field with value: "admin", "seller", or "customer"

#### 2. "Email already registered"
**Cause:** Email exists in any model (User, Customer, Seller)
**Solution:** Use a different email address

#### 3. "Seller account is pending approval"
**Cause:** Seller trying to login before admin approval
**Solution:** Admin must approve seller first

#### 4. "Invalid email or password"
**Cause:** Wrong credentials or user doesn't exist
**Solution:** Verify email and password are correct

#### 5. "Account is deactivated"
**Cause:** User's `isActive` is false
**Solution:** Contact administrator to activate account

#### 6. Multiple Validation Errors
**Cause:** Multiple fields fail validation
**Solution:** Fix all validation errors mentioned in the response

#### 7. Token Not Working After Logout
**Cause:** Token was blacklisted during logout
**Solution:** Login again to get a new token

---

## Quick Reference

### Registration Endpoints
- `POST /api/users/register` - Register any role

### Login Endpoints
- `POST /api/users/login` - Login any role

### Protected Endpoints
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/sellers/pending` - Get pending sellers (admin)
- `PUT /api/auth/seller/approve/:id` - Approve seller (admin)
- `PUT /api/auth/seller/reject/:id` - Reject seller (admin)

### Required Fields by Role

#### Admin
- `role`: "admin"
- `name`: String (2-50 chars)
- `email`: Valid email
- `password`: String (min 8 chars)

#### Seller
- `role`: "seller"
- `name`: String (2-50 chars)
- `shopName`: String (2-100 chars)
- `email`: Valid email
- `password`: String (min 8 chars)
- `phone_no`: String (10-15 digits)
- `address`: String (non-empty)

#### Customer
- `role`: "customer"
- `name`: String (2-50 chars)
- `email`: Valid email
- `password`: String (min 8 chars)
- `phone_no`: String (10-15 digits)
- `address`: String (optional)

### Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid credentials)
- `403` - Forbidden (Not approved)
- `404` - Not Found
- `500` - Server Error

---

## Best Practices

1. **Always include role in registration** - Makes validation clearer
2. **Include role in login** - Faster lookup, avoids ambiguity
3. **Save tokens securely** - Don't expose tokens in logs
4. **Handle errors gracefully** - Check response status codes
5. **Validate on client side** - Reduce server requests
6. **Use environment variables** - Store base URL and tokens
7. **Test all validation errors** - Ensure proper error messages
8. **Test role-based access** - Verify permissions work correctly

---

Happy Testing! 🚀

