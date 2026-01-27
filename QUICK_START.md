# 🚀 Quick Start Guide - Blockchain Supply Chain

## Access Your Application

1. **Frontend Dashboard**: http://localhost:3000
2. **Backend API**: http://localhost:5000/api

---

## Login / Register

### Demo Admin Account:
- **Username**: rohith
- **Password**: rohith$2006
- **Role**: admin

Or register a new account by clicking "Register here"

---

## 🎯 Quick Workflow

### 1️⃣ Create Order
1. Go to Dashboard
2. Fill in the form:
   - Customer ID: e.g., `CUST-001`
   - Product Name: e.g., `iPhone 15`
   - Product ID: e.g., `PROD-001`
   - Quantity: e.g., `2`
3. Click **Create Order**
4. ✅ Order created with blockchain hash!

### 2️⃣ Dispatch Order
1. Click "View" on your order
2. Scroll to "Dispatch Order" section
3. GPS Tracker ID will auto-generate or you can enter your own
4. Click **Dispatch & Generate QR Code**
5. 📱 QR code is generated with blockchain data!

### 3️⃣ Track in Real-Time
1. Click "View" on dispatched order
2. Go to "Submit Location Update" section
3. Enter latitude & longitude:
   - **Example 1**: 28.7041, 77.1025 (Delhi)
   - **Example 2**: 28.5355, 77.3910 (Faridabad)
   - **Example 3**: 28.9124, 77.7041 (Ghaziabad)
4. Click **Update Location (Blockchain)**
5. 📍 Location recorded on blockchain with signature!

### 4️⃣ Mark as Delivered
1. Click "View" on order in "out-for-delivery" status
2. Go to "Mark as Delivered" section
3. Enter delivery proof (e.g., signature hash, photo hash)
4. Click **Confirm Delivery**
5. ✅ Order delivered! Get verification link

### 5️⃣ Verify Authenticity
1. Scan QR code with any QR code reader
2. Or access verification link directly: `http://localhost:3000/verify/{OrderID}`
3. See complete blockchain history and order status

---

## 📊 Order Status Lifecycle

```
pending (Created)
   ↓
packed (Ready for dispatch)
   ↓
dispatched (GPS Tracker assigned, QR code generated)
   ↓
in-transit (Location updates submitted)
   ↓
out-for-delivery (Final stage before delivery)
   ↓
delivered (Completed & verified on blockchain)
```

---

## 🔗 Blockchain Features

### What Gets Recorded?
- ✅ Order creation
- ✅ Dispatch event
- ✅ Each GPS location update
- ✅ Status changes
- ✅ Final delivery confirmation

### How It's Verified?
- **SHA-256 Hashing**: Each order has unique blockchain hash
- **HMAC Signatures**: GPS locations are cryptographically signed
- **Transaction IDs**: Each event has unique transaction ID
- **Timestamp**: All events are timestamped in UTC
- **QR Code**: Contains blockchain hash for verification

---

## 🗺️ GPS Tracking

### Test Locations (India)
Use these coordinates to test GPS tracking:

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Delhi | 28.7041 | 77.1025 |
| Gurgaon | 28.4089 | 77.0235 |
| Noida | 28.5355 | 77.3910 |
| Faridabad | 28.4089 | 77.3178 |
| Ghaziabad | 28.9124 | 77.7041 |

**Important**: Each new location cannot be more than 500km away from the previous location (realistic travel validation).

---

## 📋 API Quick Reference

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-001","productName":"Laptop","productId":"PROD-001","quantity":1}'
```

### Get Order with Blockchain History
```bash
curl -X GET http://localhost:5000/api/orders/ORD-xxx \
  -H "Authorization: Bearer {token}"
```

### Verify Order (Public - No Auth Needed)
```bash
curl -X GET http://localhost:5000/api/orders/verify/ORD-xxx
```

### Submit GPS Location
```bash
curl -X POST http://localhost:5000/api/orders/location/ORD-xxx \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.7041,"longitude":77.1025,"gpsTrackerId":"GPS-001"}'
```

---

## 🎯 Key Blockchain Concepts Implemented

### 1. Immutability
- Once a record is created, it cannot be changed
- All updates create new transactions
- Complete audit trail maintained

### 2. Transparency
- Every stakeholder can verify order status
- QR code links to public verification
- No hidden or tampering possible

### 3. Authentication
- Each location is cryptographically signed
- GPS tracker ID must match order
- Only authorized devices can submit updates

### 4. Smart Contracts
- Automated status transition validation
- Rules enforced automatically
- Cannot skip or reverse stages

### 5. Decentralization (Simulated)
- In production, would use actual blockchain
- Current implementation uses immutable JSON records
- Same security principles applied

---

## 🐛 Troubleshooting

### Orders not loading?
- Check browser console (F12) for errors
- Ensure backend is running: `npm start` in backend folder
- Verify token is stored in localStorage

### GPS location rejected?
- Check coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Ensure distance from previous location is realistic (<500km)
- Verify GPS Tracker ID matches order

### QR code not generating?
- Order must be in "dispatched" status or later
- Try refreshing the page
- Check browser console for errors

### Cannot change status?
- Status must follow the valid lifecycle
- Cannot skip stages (e.g., cannot go from pending to in-transit)
- Complete the previous stage first

---

## 📞 Support & Resources

- Backend logs: Check terminal where `npm start` is running
- Frontend logs: Press F12 and check Console tab
- API documentation: See `BLOCKCHAIN_IMPLEMENTATION.md`
- Error messages: Read alerts carefully - they indicate next steps

---

## 🎓 Educational Value

This system teaches:
- Blockchain fundamentals
- Cryptographic hashing
- Digital signatures
- Supply chain management
- Real-time GPS tracking
- QR code verification
- API design
- Frontend-backend integration

Learn by experimenting with the system and observing blockchain records!
