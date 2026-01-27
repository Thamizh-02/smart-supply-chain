const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataFile = path.join(__dirname, "../data.json");

function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return { users: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

router.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  const data = readData();
  
  const user = data.users.find(u => u.username === username && u.password === password && u.role === role);

  if (!user) return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ username, role }, "secretkey");
  res.json({ token, role });
});

router.post("/register", (req, res) => {
  const { username, email, password, role } = req.body;
  const data = readData();

  // Check if user already exists
  const existingUser = data.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ msg: "Username already exists" });
  }

  // Create new user
  const newUser = { username, email, password, role };
  data.users.push(newUser);
  writeData(data);

  const token = jwt.sign({ username, role }, "secretkey");
  res.json({ token, role });
});

module.exports = router;
