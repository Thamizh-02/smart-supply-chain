# Supply Chain Blockchain System - Diagnostic Test Guide

## Current System Status

### Servers
- ✅ Backend Server: Running on http://localhost:5000
- ✅ Frontend Server: Running on http://localhost:3000
- ✅ Database: JSON file-based (data.json)

### Recent Fixes Applied
1. **Auth Middleware** - Fixed Bearer token parsing
   - Now properly strips "Bearer " prefix from Authorization header
   - Added error logging for token verification failures

2. **Frontend loadOrders()** - Enhanced error handling
   - Added HTTP status validation
   - Added array type checking
   - Better error messages with specific details

3. **Backend GET /orders** - Added error handling
   - Wrapped in try-catch block
   - Defaults to empty array if data.orders is undefined
   - Returns detailed error responses

## Quick Test Procedure

### Step 1: Verify Authentication
1. Open http://localhost:3000 in browser
2. Open Developer Tools (F12 → Console tab)
3. Try to login with existing user:
   - Username: `rohith`
   - Password: `rohith$2006`
   - Role: `admin`
4. Expected: Browser redirects to dashboard.html and token appears in console logs

**Expected Console Output:**
```
Attempting login with username: rohith role: admin
Login response status: 200
Login response data: {token: "eyJhbGc...", role: "admin"}
Token received, storing in localStorage
Redirecting to dashboard
```

### Step 2: Verify Dashboard Loads
1. After successful login, verify dashboard.html loads
2. Check Console for errors
3. Verify "Orders" section appears with table headers

**Expected Result:** Empty orders table with message "No orders yet"

### Step 3: Create a New Order
1. Fill in order creation form:
   - Customer ID: `CUST-001`
   - Product Name: `Test Product`
   - Product ID: `PROD-001`
   - Quantity: `5`
2. Click "Create Order"
3. Check Console for success message

**Expected Behavior:**
- Order ID generated in format `ORD-[timestamp]-[random]`
- New order appears in orders table
- Console shows: "Order created successfully"

### Step 4: Verify Order Details
1. Click "View" button on created order
2. Verify order details card displays:
   - Order ID
   - Customer ID
   - Product Name
   - Quantity
   - Status Timeline
   - Blockchain Hash
   - Transaction ID

**Expected Result:** All fields populated without errors

## Troubleshooting Guide

### Issue: "Cannot read properties of undefined (reading 'orderId')"

**Root Causes & Solutions:**

1. **Missing or Invalid Token**
   - **Check:** Open F12 Console → Type `localStorage.getItem('token')`
   - **Expected:** Returns JWT token string starting with `ey...`
   - **Fix:** Re-login and ensure you see console logs showing token received

2. **Backend Not Returning Orders Array**
   - **Check:** In Console, type:
   ```javascript
   fetch('http://localhost:5000/api/orders', {
     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
   }).then(r => r.json()).then(d => console.log(d))
   ```
   - **Expected:** Returns array `[]` or array with order objects
   - **Fix:** Check if Backend server is running: `http://localhost:5000/api/orders` should not give connection error

3. **CORS Issues**
   - **Check:** Look for "CORS error" in Console
   - **Expected:** No CORS errors
   - **Fix:** Backend has `app.use(cors())` - if errors persist, restart backend

4. **Malformed Token in Authorization Header**
   - **Check:** Backend logs should show token parsing
   - **Expected:** Token should be parsed correctly after "Bearer " prefix removal
   - **Fix:** Frontend sends `Authorization: 'Bearer ' + token` (with space) - correct format

### Issue: 401 Unauthorized Error

**Check:**
1. Verify token exists: `localStorage.getItem('token')` in Console
2. Verify token format: Should start with `eyJ...` 
3. Check backend logs for token verification errors

**Solutions:**
1. Re-login
2. Clear localStorage: `localStorage.clear()` then reload
3. Check credentials match data.json users:
   ```javascript
   // In browser console:
   fetch('http://localhost:5000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       username: 'rohith', 
       password: 'rohith$2006', 
       role: 'admin' 
     })
   }).then(r => r.json()).then(d => console.log(d))
   ```

### Issue: "No orders yet" but orders were created

**Check:**
1. Verify data.json file exists and is readable
2. Check if orders are saved: `cat backend/data.json` in terminal
3. Verify createOrder() is actually posting to backend

**Solutions:**
1. Manually add test order to data.json:
   ```json
   {
     "orderId": "ORD-TEST-001",
     "customerId": "CUST-001",
     "productName": "Test Product",
     "productId": "PROD-001",
     "quantity": 5,
     "status": "pending",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```
2. Restart backend server
3. Reload dashboard and check if order appears

## Data Structure Reference

### User Object (data.json)
```json
{
  "username": "rohith",
  "email": "rohithv3069@gmail.com",
  "password": "rohith$2006",
  "role": "admin"
}
```

### Order Object (data.json)
```json
{
  "orderId": "ORD-1234567890-abc123",
  "customerId": "CUST-001",
  "productName": "Electronics",
  "productId": "PROD-001",
  "quantity": 5,
  "status": "pending",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "gpsTrackerId": null,
  "qrCode": null,
  "blockchainHash": "sha256-hash-here",
  "transactionId": "tx-id-here",
  "locations": []
}
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login with username/password/role
- `POST /api/auth/register` - Register new user

### Orders (Protected - Requires Bearer Token)
- `POST /api/orders/create` - Create new order
- `GET /api/orders` - Get all orders for user
- `GET /api/orders/:orderId` - Get order details
- `POST /api/orders/dispatch/:orderId` - Dispatch order
- `POST /api/orders/status/:orderId` - Update order status
- `POST /api/orders/location/:orderId` - Submit GPS location
- `POST /api/orders/deliver/:orderId` - Mark as delivered

### Verification (Public - No Auth Required)
- `GET /api/orders/verify/:orderId` - Verify order authenticity

## Server Restart Procedure

If you experience persistent issues:

1. **Stop Servers:**
   ```bash
   # In PowerShell/CMD
   taskkill /F /IM node.exe
   ```

2. **Restart Backend:**
   ```bash
   cd "c:\Users\Elumalai\OneDrive\Documents\supply smart chain\backend"
   npm start
   ```

3. **Restart Frontend (New Terminal):**
   ```bash
   cd "c:\Users\Elumalai\OneDrive\Documents\supply smart chain\frontend"
   npm start
   ```

4. **Clear Browser Cache & Refresh:**
   - Open http://localhost:3000
   - Press Ctrl+Shift+Delete to open cache/storage settings
   - Clear localStorage
   - Reload page

## Console Debugging Commands

Run these in browser Console (F12) to diagnose issues:

```javascript
// Check if token exists
console.log("Token:", localStorage.getItem('token'));

// Test login endpoint
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'rohith', password: 'rohith$2006', role: 'admin' })
}).then(r => r.json()).then(d => console.log("Login response:", d));

// Test get orders
fetch('http://localhost:5000/api/orders', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(d => console.log("Orders:", d));

// Test create order
fetch('http://localhost:5000/api/orders/create', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({ customerId: 'CUST-001', productName: 'Test', productId: 'PROD-001', quantity: 1 })
}).then(r => r.json()).then(d => console.log("Create order response:", d));
```

## Success Indicators

✅ System is working correctly when:
1. Login redirects to dashboard with success messages
2. Orders table displays without errors
3. Creating orders adds them to the table immediately
4. Clicking "View" displays full order details
5. Console shows no "Cannot read properties of undefined" errors
6. All error messages are descriptive (not generic)

