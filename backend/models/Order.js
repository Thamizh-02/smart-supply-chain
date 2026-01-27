const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  status: String,
  gps: String,
  customer: String
});

module.exports = mongoose.model("Order", orderSchema);
