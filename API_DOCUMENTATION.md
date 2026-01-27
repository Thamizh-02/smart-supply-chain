# 📚 Blockchain Supply Chain API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/verify`) require JWT token:
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### Login
**POST** `/auth/login`

```json
{
  "username": "rohith",
  "password": "rohith$2006",
  "role": "admin"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin"
}
```

---

### Register
**POST** `/auth/register`

```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "customer"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

---

## 📦 Order Endpoints

### 1️⃣ Create Order
**POST** `/orders/create`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "customerId": "CUST-001",
  "productName": "iPhone 15",
  "productId": "PROD-001",
  "quantity": 2
}
```

**Response** (200):
```json
{
  "msg": "Order created successfully",
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "customerId": "CUST-001",
    "productName": "iPhone 15",
    "productId": "PROD-001",
    "quantity": 2,
    "status": "pending",
    "createdAt": "2026-01-27T12:00:00.000Z",
    "gpsTrackerId": null,
    "qrCode": null,
    "locations": [],
    "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
    "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b"
  },
  "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
  "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b"
}
```

---

### 2️⃣ Dispatch Order
**POST** `/orders/dispatch/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "gpsTrackerId": "GPS-TRACKER-001"
}
```

**Response** (200):
```json
{
  "msg": "Order dispatched successfully",
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "status": "dispatched",
    "gpsTrackerId": "GPS-TRACKER-001",
    "qrCode": {
      "data": "{\"orderId\":\"ORD-1704830645123-abc123\",\"blockchainHash\":\"0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4\",\"transactionId\":\"0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b\",\"verificationUrl\":\"http://localhost:3000/verify/ORD-1704830645123-abc123\",\"timestamp\":\"2026-01-27T12:05:00.000Z\"}",
      "hash": "0x7d3e5f2a9b1c4d6e8f0a2b4c6d8e0f1a",
      "generatedAt": "2026-01-27T12:05:00.000Z"
    }
  },
  "qrCode": "{\"orderId\":\"ORD-1704830645123-abc123\"...}",
  "gpsTrackerId": "GPS-TRACKER-001"
}
```

---

### 3️⃣ Update Order Status
**POST** `/orders/status/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "newStatus": "in-transit"
}
```

**Valid Status Transitions**:
- `pending` → `packed`
- `packed` → `dispatched`
- `dispatched` → `in-transit`
- `in-transit` → `out-for-delivery`
- `out-for-delivery` → `delivered`

**Response** (200):
```json
{
  "msg": "Order status updated",
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "status": "in-transit",
    "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
    "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b"
  },
  "blockchainTransaction": "0x2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f"
}
```

---

### 4️⃣ Submit GPS Location Update
**POST** `/orders/location/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "gpsTrackerId": "GPS-TRACKER-001"
}
```

**Validation Rules**:
- GPS Tracker ID must match order's assigned tracker
- Distance from previous location must be ≤ 500km
- Coordinates must be valid (lat: -90 to 90, lon: -180 to 180)

**Response** (200):
```json
{
  "msg": "Location recorded on blockchain",
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "gpsTrackerId": "GPS-TRACKER-001",
    "timestamp": "2026-01-27T12:15:00.000Z",
    "signature": "abc123def456ghi789jkl012mno345pqr"
  },
  "blockchainTransaction": "0x2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
  "orderStatus": "in-transit"
}
```

**Error Responses**:

404 - Order not found:
```json
{
  "msg": "Order not found"
}
```

403 - GPS Tracker ID mismatch:
```json
{
  "msg": "GPS tracker ID mismatch"
}
```

400 - Invalid location change:
```json
{
  "msg": "Location change appears unrealistic (too far)"
}
```

---

### 5️⃣ Mark Order as Delivered
**POST** `/orders/deliver/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "deliveryProof": "Signature verified on photo hash"
}
```

**Response** (200):
```json
{
  "msg": "Order delivered successfully",
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "status": "delivered",
    "deliveredAt": "2026-01-27T14:30:00.000Z",
    "deliveryProof": "Signature verified on photo hash",
    "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
    "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b"
  },
  "blockchainTransaction": "0x2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
  "verificationUrl": "http://localhost:3000/verify/ORD-1704830645123-abc123"
}
```

---

### 6️⃣ Get Order Details with Blockchain History
**GET** `/orders/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "customerId": "CUST-001",
    "productName": "iPhone 15",
    "productId": "PROD-001",
    "quantity": 2,
    "status": "delivered",
    "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
    "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b",
    "gpsTrackerId": "GPS-TRACKER-001",
    "qrCode": { ... },
    "locations": [ ... ],
    "createdAt": "2026-01-27T12:00:00.000Z",
    "deliveredAt": "2026-01-27T14:30:00.000Z",
    "deliveryProof": "..."
  },
  "blockchainHistory": [
    {
      "transactionId": "0x5f8e2a9b1c3d4e5f6a7b8c9d0e1f2a3b",
      "orderId": "ORD-1704830645123-abc123",
      "eventType": "order_created",
      "timestamp": "2026-01-27T12:00:00.000Z",
      "data": { ... },
      "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4"
    },
    {
      "transactionId": "0x2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
      "orderId": "ORD-1704830645123-abc123",
      "eventType": "dispatched",
      "timestamp": "2026-01-27T12:05:00.000Z",
      "data": { ... },
      "blockchainHash": "0x7d3e5f2a9b1c4d6e8f0a2b4c6d8e0f1a"
    }
  ],
  "gpsHistory": [
    {
      "orderId": "ORD-1704830645123-abc123",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "gpsTrackerId": "GPS-TRACKER-001",
      "timestamp": "2026-01-27T12:15:00.000Z",
      "signature": "abc123def456...",
      "blockchainHash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
    }
  ],
  "verificationHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
  "qrCode": { ... }
}
```

---

### 7️⃣ Get All Orders
**GET** `/orders`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200):
```json
[
  {
    "orderId": "ORD-1704830645123-abc123",
    "customerId": "CUST-001",
    "productName": "iPhone 15",
    "status": "delivered",
    ...
  },
  {
    "orderId": "ORD-1704830700456-def456",
    "customerId": "CUST-002",
    "productName": "Laptop",
    "status": "in-transit",
    ...
  }
]
```

---

### 8️⃣ Verify Order Authenticity (Public)
**GET** `/orders/verify/:orderId`

**Path Parameters**:
```
orderId: ORD-1704830645123-abc123
```

**Note**: This endpoint does NOT require authentication

**Response** (200):
```json
{
  "authentic": true,
  "order": {
    "orderId": "ORD-1704830645123-abc123",
    "status": "delivered",
    "customerId": "CUST-001",
    "productName": "iPhone 15",
    "createdAt": "2026-01-27T12:00:00.000Z",
    "deliveredAt": "2026-01-27T14:30:00.000Z"
  },
  "blockchainHash": "0x34a2f8c9e2b1d5f8a4c7e9b2d5f8a1c4",
  "transactionCount": 8,
  "locations": 5
}
```

**Error Response** (404):
```json
{
  "msg": "Order not found",
  "authentic": false
}
```

---

## 🧪 cURL Examples

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "productName": "iPhone 15",
    "productId": "PROD-001",
    "quantity": 2
  }'
```

### Dispatch Order
```bash
curl -X POST http://localhost:5000/api/orders/dispatch/ORD-1704830645123-abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"gpsTrackerId": "GPS-TRACKER-001"}'
```

### Submit Location
```bash
curl -X POST http://localhost:5000/api/orders/location/ORD-1704830645123-abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.7041,
    "longitude": 77.1025,
    "gpsTrackerId": "GPS-TRACKER-001"
  }'
```

### Mark as Delivered
```bash
curl -X POST http://localhost:5000/api/orders/deliver/ORD-1704830645123-abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"deliveryProof": "Signature verified"}'
```

### Get Order Details
```bash
curl -X GET http://localhost:5000/api/orders/ORD-1704830645123-abc123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Verify Order (Public)
```bash
curl -X GET http://localhost:5000/api/orders/verify/ORD-1704830645123-abc123
```

---

## 🔗 Blockchain Data Flow

```
Create Order
    ↓
SHA-256(Order Metadata) → Blockchain Hash
    ↓
Create Transaction
    ↓
Store in data.json["blockchain"]
    ↓
Dispatch Order
    ↓
Generate QR Code with Hash + Transaction ID
    ↓
Submit GPS Location
    ↓
HMAC-SHA256(GPS Data) → Signature
    ↓
Validate Distance using Haversine Formula
    ↓
Create Transaction with Signature
    ↓
Update Order Status
    ↓
Create Status Transaction
    ↓
Mark Delivered
    ↓
Create Final Transaction
    ↓
Order Complete - Fully Verifiable on Blockchain
```

---

## ✅ Success Response Format

All successful responses follow this format:
```json
{
  "msg": "Operation successful",
  "data": { ... },
  "blockchainTransaction": "0x...",
  "blockchainHash": "0x..."
}
```

## ❌ Error Response Format

All error responses follow this format:
```json
{
  "msg": "Error message",
  "statusCode": 400 | 401 | 403 | 404 | 500
}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (permission denied) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error |

---

## 🔐 Authentication Flow

1. **Register** → Get JWT token
2. **Login** → Get JWT token
3. **Include token** in `Authorization: Bearer {token}` header
4. **Token stored** in localStorage on frontend
5. **Token expires**: Currently no expiration (can be added)

---

## 📝 Notes

- All timestamps are in UTC ISO-8601 format
- Order IDs are unique and never repeated
- Transaction IDs are unique blockchain identifiers
- GPS locations are immutably stored
- Status transitions are validated by smart contract rules
- QR codes contain complete blockchain verification data
- Public verification endpoint requires no authentication
