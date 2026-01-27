const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const auth = require("../middleware/authMiddleware");
const blockchain = require("../utils/blockchain");

const router = express.Router();
const dataFile = path.join(__dirname, "../data.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return { users: [], orders: [], blockchain: [], gpsLocations: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// 1️⃣ Create Order with Blockchain Hash
router.post("/create", auth, (req, res) => {
  const data = readData();
  const { customerId, productName, productId, quantity } = req.body;

  if (!customerId || !productName || !quantity) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  const orderId = "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  const timestamp = new Date();

  const orderData = {
    orderId,
    customerId,
    productName,
    productId,
    quantity,
    status: "pending",
    createdAt: timestamp,
    gpsTrackerId: null,
    qrCode: null,
    locations: []
  };

  // Create blockchain transaction
  const blockchainHash = blockchain.generateBlockchainHash({
    orderId,
    customerId,
    productName,
    timestamp
  });

  const blockchainRecord = blockchain.createBlockchainTransaction(
    orderId,
    "order_created",
    { customerId, productName, quantity }
  );

  orderData.blockchainHash = blockchainHash;
  orderData.transactionId = blockchainRecord.transactionId;

  data.orders.push(orderData);
  data.blockchain.push(blockchainRecord);
  writeData(data);

  res.json({
    msg: "Order created successfully",
    order: orderData,
    blockchainHash: blockchainHash,
    transactionId: blockchainRecord.transactionId
  });
});

// 2️⃣ Dispatch Order with GPS Tracker & QR Code
router.post("/dispatch/:orderId", auth, (req, res) => {
  const data = readData();
  const { orderId } = req.params;
  const { gpsTrackerId } = req.body;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  if (!blockchain.validateStatusTransition(order.status, "packed")) {
    return res.status(400).json({ msg: "Invalid status transition" });
  }

  order.status = "packed";
  order.gpsTrackerId = gpsTrackerId || "GPS-" + Math.random().toString(36).substr(2, 9);

  // Generate QR Code data
  const qrData = {
    orderId: order.orderId,
    blockchainHash: order.blockchainHash,
    transactionId: order.transactionId,
    verificationUrl: `http://localhost:3000/verify/${order.orderId}`,
    timestamp: new Date()
  };

  order.qrCode = {
    data: JSON.stringify(qrData),
    hash: blockchain.generateBlockchainHash(qrData),
    generatedAt: new Date()
  };

  // Record dispatch event on blockchain
  const dispatchTransaction = blockchain.createBlockchainTransaction(
    orderId,
    "dispatched",
    { gpsTrackerId: order.gpsTrackerId, qrCode: order.qrCode.hash }
  );

  data.blockchain.push(dispatchTransaction);
  writeData(data);

  res.json({
    msg: "Order dispatched successfully",
    order,
    qrCode: order.qrCode.data,
    gpsTrackerId: order.gpsTrackerId
  });
});

// Update status to "dispatched"
router.post("/status/:orderId", auth, (req, res) => {
  const data = readData();
  const { orderId } = req.params;
  const { newStatus } = req.body;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  if (!blockchain.validateStatusTransition(order.status, newStatus)) {
    return res.status(400).json({ msg: `Invalid status transition from ${order.status} to ${newStatus}` });
  }

  order.status = newStatus;

  // Record status change on blockchain
  const statusTransaction = blockchain.createBlockchainTransaction(
    orderId,
    "status_updated",
    { previousStatus: order.status, newStatus }
  );

  data.blockchain.push(statusTransaction);
  writeData(data);

  res.json({
    msg: "Order status updated",
    order,
    blockchainTransaction: statusTransaction.transactionId
  });
});

// 3️⃣ Submit GPS Location Update (with signature verification)
router.post("/location/:orderId", auth, (req, res) => {
  const data = readData();
  const { orderId } = req.params;
  const { latitude, longitude, gpsTrackerId } = req.body;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  const timestamp = new Date();

  // Verify GPS tracker ID matches
  if (order.gpsTrackerId !== gpsTrackerId) {
    return res.status(403).json({ msg: "GPS tracker ID mismatch" });
  }

  // Validate location checkpoint
  if (order.locations.length > 0) {
    const lastLocation = order.locations[order.locations.length - 1];
    if (!blockchain.validateLocationCheckpoint(latitude, longitude, lastLocation.latitude, lastLocation.latitude)) {
      return res.status(400).json({ msg: "Location change appears unrealistic (too far)" });
    }
  }

  // Sign GPS data
  const gpsSignature = blockchain.signGPSData(latitude, longitude, timestamp.toISOString(), gpsTrackerId);

  const locationUpdate = {
    latitude,
    longitude,
    gpsTrackerId,
    timestamp,
    signature: gpsSignature
  };

  order.locations.push(locationUpdate);

  // Update order status to "in-transit"
  if (order.status === "dispatched") {
    order.status = "in-transit";
  }

  // Record location on blockchain
  const locationTransaction = blockchain.createBlockchainTransaction(
    orderId,
    "location_updated",
    { latitude, longitude, signature: gpsSignature }
  );

  data.gpsLocations.push({
    orderId,
    ...locationUpdate,
    blockchainHash: locationTransaction.blockchainHash
  });

  data.blockchain.push(locationTransaction);
  writeData(data);

  res.json({
    msg: "Location recorded on blockchain",
    location: locationUpdate,
    blockchainTransaction: locationTransaction.transactionId,
    orderStatus: order.status
  });
});

// 4️⃣ Deliver Order (Final Confirmation)
router.post("/deliver/:orderId", auth, (req, res) => {
  const data = readData();
  const { orderId } = req.params;
  const { deliveryProof } = req.body;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  if (!blockchain.validateStatusTransition(order.status, "delivered")) {
    return res.status(400).json({ msg: "Order cannot be marked as delivered at this stage" });
  }

  order.status = "delivered";
  order.deliveryProof = deliveryProof;
  order.deliveredAt = new Date();

  // Record delivery on blockchain
  const deliveryTransaction = blockchain.createBlockchainTransaction(
    orderId,
    "delivered",
    { deliveryProof, locations: order.locations.length }
  );

  data.blockchain.push(deliveryTransaction);
  writeData(data);

  res.json({
    msg: "Order delivered successfully",
    order,
    blockchainTransaction: deliveryTransaction.transactionId,
    verificationUrl: `http://localhost:3000/verify/${orderId}`
  });
});

// 5️⃣ Get Order with Full Blockchain History
router.get("/:orderId", auth, (req, res) => {
  const data = readData();
  const { orderId } = req.params;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  const blockchainHistory = data.blockchain.filter(b => b.orderId === orderId);
  const gpsHistory = data.gpsLocations.filter(g => g.orderId === orderId);

  res.json({
    order,
    blockchainHistory,
    gpsHistory,
    verificationHash: order.blockchainHash,
    qrCode: order.qrCode
  });
});

// Get all orders
router.get("/", auth, (req, res) => {
  try {
    const data = readData();
    const orders = data.orders || [];
    res.json(orders);
  } catch (err) {
    console.log("Error reading orders:", err);
    res.status(500).json({ msg: "Error reading orders", error: err.message });
  }
});

// Verify order authenticity (public endpoint)
router.get("/verify/:orderId", (req, res) => {
  const data = readData();
  const { orderId } = req.params;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ msg: "Order not found", authentic: false });
  }

  const blockchainHistory = data.blockchain.filter(b => b.orderId === orderId);

  res.json({
    authentic: true,
    order: {
      orderId: order.orderId,
      status: order.status,
      customerId: order.customerId,
      productName: order.productName,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt
    },
    blockchainHash: order.blockchainHash,
    transactionCount: blockchainHistory.length,
    locations: order.locations.length
  });
});

module.exports = router;
