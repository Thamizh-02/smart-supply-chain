# 🔗 Blockchain-Enabled Supply Chain System

## Overview
This supply chain management system uses blockchain technology to create an immutable, transparent, and verifiable order lifecycle with GPS tracking integration.

---

## 🏗️ System Architecture

### 1️⃣ Order Creation
- **Unique Order ID**: Format `ORD-{timestamp}-{random}`
- **Blockchain Hash**: SHA-256 hash of order metadata (Order ID, Customer ID, Product Name, Timestamp)
- **Transaction ID**: Unique blockchain transaction identifier
- **Initial Status**: `pending`

```
Order Data → SHA-256 Hashing → Blockchain Hash
              ↓
         Transaction Created
              ↓
         Immutable Record
```

### 2️⃣ Shipment Dispatch
- **GPS Tracker Assignment**: Auto-generated or manually assigned GPS Tracker ID
- **QR Code Generation**: Contains Order ID, Blockchain Hash, Transaction ID, Verification URL
- **Status Transition**: `pending` → `packed` → `dispatched`
- **Smart Contract Validation**: Ensures valid status transitions

### 3️⃣ In-Transit Tracking
- **GPS Location Updates**: Real-time coordinates with cryptographic signatures
- **Location Validation**: 
  - Prevents unrealistic jumps (max 500km per update)
  - Verifies GPS tracker ID authenticity
  - Uses HMAC-SHA256 signature verification
- **Blockchain Recording**: Each location update creates an immutable transaction
- **Status**: `in-transit`

### 4️⃣ Status Lifecycle (Smart Contract Rules)
Valid status transitions:
```
pending → packed → dispatched → in-transit → out-for-delivery → delivered
```

Each transition:
- ✅ Verified by smart contract rules
- 📝 Recorded immutably on blockchain
- 🔐 Cannot be reversed or skipped
- ⏱️ Timestamped with UTC precision

### 5️⃣ Delivery Confirmation
- **Final Status**: `delivered`
- **Delivery Proof**: Signature, photo hash, or verification code
- **Blockchain Confirmation**: Immutable delivery record
- **Public Verification URL**: Customers can verify authenticity

---

## 📊 API Endpoints

### Order Management
```
POST /api/orders/create
- Create new order with blockchain hash
- Headers: Authorization: Bearer {token}
- Body: { customerId, productName, productId, quantity }

POST /api/orders/dispatch/:orderId
- Dispatch order and generate QR code
- Headers: Authorization: Bearer {token}
- Body: { gpsTrackerId }

POST /api/orders/status/:orderId
- Update order status
- Headers: Authorization: Bearer {token}
- Body: { newStatus }

POST /api/orders/location/:orderId
- Submit GPS location update
- Headers: Authorization: Bearer {token}
- Body: { latitude, longitude, gpsTrackerId }

POST /api/orders/deliver/:orderId
- Mark order as delivered
- Headers: Authorization: Bearer {token}
- Body: { deliveryProof }

GET /api/orders/:orderId
- Get order details with blockchain history
- Headers: Authorization: Bearer {token}

GET /api/orders/verify/:orderId
- Public verification (no auth required)
```

---

## 🔐 Security Features

### Blockchain Hash Verification
- **Algorithm**: SHA-256
- **Input**: Order ID + Customer ID + Product Name + Timestamp
- **Purpose**: Ensures data integrity and immutability
- **Verification**: Compare calculated hash with stored blockchain hash

### GPS Location Signing
- **Algorithm**: HMAC-SHA256
- **Secret Key**: `gps-secret-key` (hardcoded for this demo, use environment variable in production)
- **Input**: Latitude + Longitude + Timestamp + GPS Tracker ID
- **Purpose**: Prevents fake or manipulated location data
- **Authorization**: Only registered GPS trackers can submit updates

### Status Transition Validation
- **Smart Contract Rules**: Enforced state machine
- **Prevention**: Prevents jumping stages or reversing status
- **Logging**: All invalid attempts are logged

---

## 📱 QR Code Integration

### QR Code Data Structure
```json
{
  "orderId": "ORD-1704xxx-abc123",
  "blockchainHash": "0x34a2f...",
  "transactionId": "0x5f8e...",
  "verificationUrl": "http://localhost:3000/verify/ORD-1704xxx-abc123",
  "timestamp": "2026-01-27T12:30:45.000Z"
}
```

### Scanning Process
1. Customer scans QR code with smartphone
2. QR code decodes and extracts Order ID + Blockchain Hash
3. Verification URL is accessed
4. System checks immutable blockchain records
5. ✅ Authenticity confirmed or ❌ Fraud detected

---

## 📍 GPS Tracking Verification

### Location Validation Rules
1. **Tracker ID Match**: GPS Tracker ID must match order's assigned tracker
2. **Distance Validation**: New location cannot be >500km from previous location
3. **Signature Verification**: HMAC-SHA256 signature must match calculated signature
4. **Timestamp**: Must be valid ISO-8601 timestamp

### Realistic Travel Detection
```javascript
// Haversine formula for distance calculation
Distance = 2 * R * arcsin(sqrt(sin²(Δφ/2) + cos φ1 * cos φ2 * sin²(Δλ/2)))
where R = 6371 km (Earth's radius)
```

---

## 💾 Data Storage

### JSON File Structure
```json
{
  "users": [
    {
      "username": "admin",
      "email": "admin@example.com",
      "password": "hashed_password",
      "role": "admin"
    }
  ],
  "orders": [
    {
      "orderId": "ORD-xxx",
      "customerId": "CUST-001",
      "productName": "iPhone 15",
      "productId": "PROD-001",
      "quantity": 2,
      "status": "delivered",
      "blockchainHash": "0x34a2f...",
      "transactionId": "0x5f8e...",
      "gpsTrackerId": "GPS-001",
      "qrCode": { "data": "...", "hash": "..." },
      "locations": [],
      "createdAt": "2026-01-27T12:00:00.000Z",
      "deliveredAt": "2026-01-27T14:30:00.000Z",
      "deliveryProof": "Signature verified"
    }
  ],
  "blockchain": [
    {
      "transactionId": "0x5f8e...",
      "orderId": "ORD-xxx",
      "eventType": "order_created",
      "timestamp": "2026-01-27T12:00:00.000Z",
      "data": { ... },
      "blockchainHash": "0x34a2f..."
    }
  ],
  "gpsLocations": [
    {
      "orderId": "ORD-xxx",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "gpsTrackerId": "GPS-001",
      "timestamp": "2026-01-27T12:15:00.000Z",
      "signature": "abc123def456...",
      "blockchainHash": "0x34a2f..."
    }
  ]
}
```

---

## 🎯 Usage Workflow

### Step 1: Create Order
```
User → Dashboard → Create Order Form
↓
System generates Order ID + Blockchain Hash
↓
Transaction recorded on blockchain
```

### Step 2: Dispatch Order
```
Admin → View Order → "Dispatch" Button
↓
GPS Tracker ID assigned
QR Code generated
Blockchain transaction created
```

### Step 3: Track In-Transit
```
Real-time GPS updates submitted
↓
Location validated (distance, signature, tracker ID)
↓
Only valid updates recorded on blockchain
```

### Step 4: Deliver
```
Delivery personnel → Confirm Delivery
↓
Final blockchain transaction created
↓
Customer receives verification URL
```

### Step 5: Verify Authenticity
```
Customer scans QR code
↓
Verification URL accessed
↓
Blockchain records checked
↓
✅ Authenticity confirmed
```

---

## 🚀 Features Implemented

✅ **Blockchain Hash Generation** - SHA-256 cryptographic hashing  
✅ **Immutable Transaction Log** - Complete order history on blockchain  
✅ **Smart Contract Rules** - Status transition validation  
✅ **GPS Signature Verification** - HMAC-SHA256 signed location data  
✅ **Location Validation** - Realistic travel distance checking  
✅ **QR Code Integration** - Unique codes with blockchain data  
✅ **Public Verification** - Customers can verify authenticity  
✅ **Real-time Tracking** - GPS location history visualization  
✅ **Status Timeline** - Visual representation of order progress  
✅ **Audit Trail** - Complete immutable history of all events  

---

## 🔧 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: JSON file (demo) / MongoDB (production)
- **Cryptography**: Node.js crypto module (SHA-256, HMAC)
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **QR Code**: QRCode.js library
- **Authentication**: JWT (JSON Web Tokens)

---

## 📋 Testing Guide

### Test 1: Create Order
```bash
POST http://localhost:5000/api/orders/create
Headers: Authorization: Bearer {token}
Body: {
  "customerId": "CUST-001",
  "productName": "Laptop",
  "productId": "PROD-001",
  "quantity": 1
}
```

### Test 2: Dispatch Order
```bash
POST http://localhost:5000/api/orders/dispatch/ORD-xxx
Headers: Authorization: Bearer {token}
Body: { "gpsTrackerId": "GPS-001" }
```

### Test 3: Submit Location
```bash
POST http://localhost:5000/api/orders/location/ORD-xxx
Headers: Authorization: Bearer {token}
Body: {
  "latitude": 28.7041,
  "longitude": 77.1025,
  "gpsTrackerId": "GPS-001"
}
```

### Test 4: Verify Authenticity (Public)
```bash
GET http://localhost:3000/verify/ORD-xxx
(No authentication required)
```

---

## 🎓 Learning Outcomes

This implementation demonstrates:
1. **Blockchain concepts** - Immutable records, transaction hashing
2. **Cryptography** - SHA-256 hashing, HMAC signatures
3. **Supply chain** - Order lifecycle, GPS tracking
4. **Smart contracts** - State machine validation
5. **API design** - RESTful endpoints with authorization
6. **Frontend integration** - Real-time dashboard updates
7. **Data visualization** - GPS maps, status timelines
8. **Security** - Token-based auth, data verification

---

## 📞 Support

For issues or questions, refer to the error messages displayed in the dashboard or check the browser console for detailed logs.
