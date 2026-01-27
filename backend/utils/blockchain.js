const crypto = require("crypto");

// Blockchain utilities for supply chain tracking

// Generate blockchain hash from order data
function generateBlockchainHash(orderData) {
  const dataString = JSON.stringify(orderData);
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

// Generate transaction ID (simulated blockchain transaction)
function generateTransactionId() {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

// Verify blockchain hash
function verifyBlockchainHash(orderData, hash) {
  const calculatedHash = generateBlockchainHash(orderData);
  return calculatedHash === hash;
}

// Generate cryptographic signature for GPS data
function signGPSData(latitude, longitude, timestamp, gpsTrackerId) {
  const data = `${latitude},${longitude},${timestamp},${gpsTrackerId}`;
  const hmac = crypto.createHmac("sha256", "gps-secret-key");
  return hmac.update(data).digest("hex");
}

// Verify GPS signature
function verifyGPSSignature(latitude, longitude, timestamp, gpsTrackerId, signature) {
  const expectedSignature = signGPSData(latitude, longitude, timestamp, gpsTrackerId);
  return expectedSignature === signature;
}

// Validate status transition according to smart contract rules
function validateStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    "pending": ["packed"],
    "packed": ["dispatched"],
    "dispatched": ["in-transit"],
    "in-transit": ["out-for-delivery"],
    "out-for-delivery": ["delivered"],
    "delivered": []
  };

  if (!validTransitions[currentStatus]) {
    return false;
  }

  return validTransitions[currentStatus].includes(newStatus);
}

// Create blockchain transaction record
function createBlockchainTransaction(orderId, eventType, data) {
  return {
    transactionId: generateTransactionId(),
    orderId,
    eventType, // "order_created", "dispatched", "location_updated", "delivered"
    timestamp: new Date(),
    data,
    blockchainHash: generateBlockchainHash({ orderId, eventType, ...data, timestamp: new Date() })
  };
}

// Verify location checkpoint validity
function validateLocationCheckpoint(currentLat, currentLon, previousLat, previousLon) {
  // Calculate distance between two coordinates (simple validation)
  // Using Haversine formula concept - prevent teleportation
  const maxDistanceKm = 500; // Max distance in km for realistic travel
  const R = 6371; // Earth's radius in km

  const dLat = (currentLat - previousLat) * Math.PI / 180;
  const dLon = (currentLon - previousLon) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(previousLat * Math.PI / 180) * Math.cos(currentLat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= maxDistanceKm;
}

module.exports = {
  generateBlockchainHash,
  generateTransactionId,
  verifyBlockchainHash,
  signGPSData,
  verifyGPSSignature,
  validateStatusTransition,
  createBlockchainTransaction,
  validateLocationCheckpoint
};
