# Quick Reference - Supply Chain Blockchain System

## ✅ System Status

- **Backend Server:** Running on http://localhost:5000 ✅
- **Frontend Server:** Running on http://localhost:3000 ✅
- **Database:** JSON file-based (backend/data.json) ✅
- **Authentication:** JWT with Bearer token support ✅

---

## 🚀 Quick Start

### Open the Application
```
http://localhost:3000
```

### Test Login
- **Username:** `rohith`
- **Password:** `rohith$2006`
- **Role:** `admin`

### Register New Account
1. Click "Register" on login page
2. Fill in all fields (username, email, password, role)
3. Click "Register"
4. You'll be logged in and redirected to dashboard

---

## 📋 What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ | JWT authentication with Bearer tokens |
| Register | ✅ | Create new user accounts |
| Create Order | ✅ | Orders saved with blockchain hashing |
| View Orders | ✅ | List all your orders |
| Order Details | ✅ | Full order info with blockchain data |
| GPS Tracking | ✅ | Submit and track locations |
| QR Code | ✅ | Generated per order for verification |
| Status Updates | ✅ | Track order through supply chain |
| Blockchain History | ✅ | Immutable transaction log |

---

## 🔧 Troubleshooting

### Problem: Login Not Working
**Solution:**
1. Open F12 (Developer Console)
2. Check Console tab for error message
3. Verify credentials: username `rohith`, password `rohith$2006`
4. Clear localStorage: `localStorage.clear()`

### Problem: Orders Not Showing
**Solution:**
1. Check Console for errors
2. Verify you're logged in (check if token exists: `localStorage.getItem('token')`)
3. Reload page (F5)
4. Check if any orders exist in data.json

### Problem: "Cannot read properties of undefined"
**Solution:**
1. Open F12 Console
2. Look for specific error message
3. Check Network tab to see API responses
4. Restart servers if needed

### Problem: Servers Not Running
**Solution:**
```bash
# Kill existing processes
taskkill /F /IM node.exe

# Restart backend
cd "c:\Users\Elumalai\OneDrive\Documents\supply smart chain\backend"
npm start

# Restart frontend (new terminal)
cd "c:\Users\Elumalai\OneDrive\Documents\supply smart chain\frontend"
npm start
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Orders (Protected)
- `POST /api/orders/create` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get order details
- `POST /api/orders/dispatch/:orderId` - Dispatch
- `POST /api/orders/status/:orderId` - Update status
- `POST /api/orders/location/:orderId` - Add GPS location
- `POST /api/orders/deliver/:orderId` - Mark delivered

### Public
- `GET /api/orders/verify/:orderId` - Verify order

---

## 🧪 Test Commands (Browser Console)

```javascript
// Test API connection
fetch('http://localhost:5000/api/orders', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(d => console.log(d))

// Create test order
fetch('http://localhost:5000/api/orders/create', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({ 
    customerId: 'CUST-001', 
    productName: 'Test Product', 
    productId: 'PROD-001', 
    quantity: 1 
  })
}).then(r => r.json()).then(d => console.log(d))

// Check token
localStorage.getItem('token')

// Clear data
localStorage.clear()
```

---

## 📊 Data Structure

### User
```json
{
  "username": "rohith",
  "email": "rohithv3069@gmail.com",
  "password": "rohith$2006",
  "role": "admin"
}
```

### Order
```json
{
  "orderId": "ORD-1234567890-abc123",
  "customerId": "CUST-001",
  "productName": "Product",
  "productId": "PROD-001",
  "quantity": 5,
  "status": "pending",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

## 📁 Project Structure

```
supply smart chain/
├── backend/
│   ├── server.js
│   ├── data.json
│   ├── routes/
│   │   ├── auth.js
│   │   └── order.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── blockchain.js
│   └── models/
│       ├── User.js
│       └── Order.js
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── script.js
│   ├── style.css
│   └── server.js
└── Documentation/
    ├── DIAGNOSTIC_TEST.md
    ├── FIXES_APPLIED.md
    ├── README.md
    └── ...
```

---

## ⚡ Recent Fixes (This Session)

1. **Auth Middleware** - Now properly parses "Bearer " token format
2. **GET /orders** - Always returns array, never undefined
3. **loadOrders()** - Validates response before processing
4. **createOrder()** - Checks response structure
5. **loadOrderDetails()** - Safe property access throughout
6. **login()** - Added console logging for debugging

**Result:** No more "Cannot read properties of undefined" errors!

---

## 🔐 Security Notes

- Passwords stored in plain text (demo only - use bcrypt in production)
- JWT secret is hardcoded (demo only - use environment variables)
- No HTTPS (use HTTPS in production)
- CORS enabled for localhost (configure for production)

---

## 📝 Order Status Flow

```
pending → packed → dispatched → in-transit → out-for-delivery → delivered
```

Each transition is validated by smart contract rules in blockchain.

---

## 🆘 Getting Help

1. **Check Console** - F12 → Console tab for error messages
2. **Check Network** - F12 → Network tab to see API responses
3. **Check Files** - Review DIAGNOSTIC_TEST.md for detailed guide
4. **Restart Servers** - Stop and restart if in doubt
5. **Clear Cache** - Ctrl+Shift+Delete to clear localStorage

---

## 💡 Tips

- Always check Console (F12) for detailed error messages
- Token is stored in localStorage automatically after login
- All API requests include Bearer token in Authorization header
- Empty orders list doesn't mean error - just no orders yet
- Each order gets unique blockchain hash
- GPS tracking requires dispatch first
- QR code generated on dispatch

---

## 🎯 Common Tasks

### Create an Order
1. Login to dashboard
2. Fill "Create New Order" form
3. Click "Create Order"
4. Order appears in list immediately

### View Order Details
1. Find order in list
2. Click "View" button
3. See full details with blockchain info

### Track Shipment
1. Open order details
2. Scroll to "Location History"
3. See all GPS waypoints plotted
4. View blockchain transaction history

### Verify Order Authenticity
1. Get order ID
2. Visit: http://localhost:5000/api/orders/verify/{ORDER_ID}
3. Returns blockchain verification details

---

## ⏰ System Architecture

```
User Browser (localhost:3000)
    ↓
Frontend (HTML/CSS/JS)
    ↓
Validates & Formats Request
    ↓
HTTP Request + Bearer Token
    ↓
Backend (localhost:5000)
    ↓
Auth Middleware (Validates Token)
    ↓
Route Handler (Business Logic)
    ↓
Data Layer (JSON File)
    ↓
Response (JSON)
    ↓
Frontend Validation & Rendering
    ↓
Display to User
```

---

## ✨ Success Indicators

✅ System working correctly when:
- Login redirects to dashboard
- Orders list loads without errors
- New orders appear immediately
- Order details display correctly
- Console shows no error messages
- All buttons work as expected

---

**Last Updated:** Current Session
**System Status:** ✅ Ready for Testing
**Documentation:** See DIAGNOSTIC_TEST.md and FIXES_APPLIED.md for details

