const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String // admin or customer
});

module.exports = mongoose.model("User", userSchema);
