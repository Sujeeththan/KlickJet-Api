# API Testing Guide - Authentication Routes

## Base URL
```
http://localhost:YOUR_PORT/api/auth
```

Replace `YOUR_PORT` with your server port (e.g., 3000, 5000, etc.)

---

## 1. Customer Registration

**Endpoint:** `POST /api/auth/register/customer`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone_no": "1234567890",
  "address": "123 Main St" // Optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone_no": "1234567890",
    "address": "123 Main St"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 2. Customer Login

**Endpoint:** `POST /api/auth/login/customer`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Customer logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone_no": "1234567890",
    "address": "123 Main St"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 3. Seller Registration

**Endpoint:** `POST /api/auth/register/seller`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "shopName": "Jane's Shop",
  "email": "jane@example.com",
  "password": "password123",
  "phone_no": "9876543210",
  "address": "456 Market St"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Seller registration successful. Your account is pending admin approval.",
  "seller": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "shopName": "Jane's Shop",
    "email": "jane@example.com",
    "status": "pending"
  }
}
```

**Note:** Seller account will be in "pending" status until admin approves.

---

## 4. Seller Login

**Endpoint:** `POST /api/auth/login/seller`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Success Response (200):** (Only if seller is approved)
```json
{
  "success": true,
  "message": "Seller logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "seller",
    "shopName": "Jane's Shop",
    "phone_no": "9876543210",
    "address": "456 Market St",
    "status": "approved"
  }
}
```

**Error Response (403):** (If seller is pending)
```json
{
  "success": false,
  "message": "Your account is pending admin approval. Please wait for approval."
}
```

---

## 5. Admin Registration

**Endpoint:** `POST /api/auth/register/admin`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 6. Admin Login

**Endpoint:** `POST /api/auth/login/admin`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 7. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone_no": "1234567890",
    "address": "123 Main St"
  }
}
```

---

## 8. Get Pending Sellers (Admin Only)

**Endpoint:** `GET /api/auth/sellers/pending`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "sellers": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "shopName": "Jane's Shop",
      "email": "jane@example.com",
      "status": "pending"
    }
  ]
}
```

---

## 9. Approve Seller (Admin Only)

**Endpoint:** `PUT /api/auth/seller/approve/:id`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Seller approved successfully",
  "seller": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "shopName": "Jane's Shop",
    "email": "jane@example.com",
    "status": "approved",
    "approvedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Testing Methods

### Method 1: Using cURL

**Customer Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone_no": "1234567890",
    "address": "123 Main St"
  }'
```

**Customer Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Current User (with token):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Method 2: Using Postman

1. Create a new request
2. Set method to `POST` or `GET`
3. Enter URL: `http://localhost:YOUR_PORT/api/auth/...`
4. For POST requests:
   - Go to "Body" tab
   - Select "raw" and "JSON"
   - Paste the JSON body
5. For protected routes:
   - Go to "Headers" tab
   - Add: `Authorization: Bearer YOUR_TOKEN_HERE`

### Method 3: Using JavaScript (Fetch API)

```javascript
// Customer Registration
fetch('http://localhost:3000/api/auth/register/customer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone_no: '1234567890',
    address: '123 Main St'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  // Save token: localStorage.setItem('token', data.token);
})
.catch(error => console.error('Error:', error));

// Customer Login
fetch('http://localhost:3000/api/auth/login/customer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  // Save token: localStorage.setItem('token', data.token);
})
.catch(error => console.error('Error:', error));

// Get Current User (with token)
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields (name, email, password, phone_no)"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Your account is pending admin approval. Please wait for approval."
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error during registration"
}
```

---

## Testing Workflow

1. **Start your server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

2. **Register an Admin:**
   - Use `POST /api/auth/register/admin`
   - Save the token

3. **Register a Customer:**
   - Use `POST /api/auth/register/customer`
   - Should get token immediately
   - Test login with `POST /api/auth/login/customer`

4. **Register a Seller:**
   - Use `POST /api/auth/register/seller`
   - Account will be in "pending" status
   - Try to login - should fail with pending message

5. **Approve Seller (as Admin):**
   - Use `GET /api/auth/sellers/pending` to see pending sellers
   - Use `PUT /api/auth/seller/approve/:id` to approve
   - Now seller can login successfully

6. **Test Protected Routes:**
   - Use `GET /api/auth/me` with token in Authorization header

