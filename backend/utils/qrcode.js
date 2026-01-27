const QRCode = require("qrcode");

// Generate QR Code with blockchain data
async function generateQRCodeWithBlockchain(orderId, blockchainHash, transactionId) {
  const qrData = {
    orderId,
    blockchainHash,
    transactionId,
    verificationUrl: `http://localhost:3000/verify/${orderId}`,
    timestamp: new Date().toISOString()
  };

  try {
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    return {
      success: true,
      qrCodeImage,
      qrData
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// Generate QR Code as SVG
async function generateQRCodeSVG(orderId, blockchainHash, transactionId) {
  const qrData = {
    orderId,
    blockchainHash,
    transactionId,
    verificationUrl: `http://localhost:3000/verify/${orderId}`,
    timestamp: new Date().toISOString()
  };

  try {
    const svg = await QRCode.toString(JSON.stringify(qrData), { type: "svg" });
    return {
      success: true,
      svg,
      qrData
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  generateQRCodeWithBlockchain,
  generateQRCodeSVG
};
