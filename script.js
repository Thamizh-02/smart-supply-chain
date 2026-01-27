// API Configuration with fallback and debugging
let API_CONFIG = {
  primary: "http://localhost:5000/api",
  secondary: "http://127.0.0.1:5000/api",
  timeout: 5000
};

let API = API_CONFIG.primary;
let serverConnected = false;

// Initialize and test connection on page load
window.addEventListener('load', async function() {
  console.log("%c🔍 Testing API Connection...", "color: blue; font-weight: bold;");
  await testAPIConnection();
});

// Function to test API connection with retries
async function testAPIConnection() {
  const endpoints = [API_CONFIG.primary, API_CONFIG.secondary];
  
  for (let endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await Promise.race([
        fetch(endpoint + "/health"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), API_CONFIG.timeout)
        )
      ]);
      
      if (response.ok) {
        API = endpoint;
        serverConnected = true;
        console.log("%c✅ Connected to backend at: " + API, "color: green; font-weight: bold;");
        showConnectionStatus("Connected", "green");
        return;
      }
    } catch (err) {
      console.warn(`❌ Failed to connect to ${endpoint}:`, err.message);
    }
  }
  
  // No connection found
  serverConnected = false;
  console.error("%c❌ ERROR: Cannot connect to backend server!", "color: red; font-weight: bold;");
  console.error("%c📍 Tried endpoints: " + endpoints.join(", "), "color: orange;");
  console.error("%c💡 Fix: Make sure backend server is running with: cd backend && node server.js", "color: orange;");
  showConnectionStatus("Disconnected", "red");
}

function showConnectionStatus(status, color) {
  // Add connection status indicator to page
  let statusDiv = document.getElementById('connection-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'connection-status';
    statusDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px 15px;
      background: ${color};
      color: white;
      border-radius: 5px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(statusDiv);
  }
  statusDiv.textContent = `Backend ${status}`;
  statusDiv.style.background = color;
}

let currentOrderId = null;
let mapCentered = false;

// ===== AUTH FUNCTIONS =====
function toggleForm() {
  document.getElementById("loginForm").style.display = 
    document.getElementById("loginForm").style.display === "none" ? "block" : "none";
  document.getElementById("registerForm").style.display = 
    document.getElementById("registerForm").style.display === "none" ? "block" : "none";
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!username || !password) {
    alert("⚠️ Please enter username and password");
    return;
  }

  // Check connection first
  if (!serverConnected) {
    alert("❌ Backend server is not running!\n\nPlease start the backend with:\ncd backend && node server.js\n\nThen try again.");
    return;
  }

  console.log("Attempting login with username:", username, "role:", role);

  fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
  .then(res => {
    console.log("Login response status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("Login response data:", data);
    if (data.token) {
      console.log("Token received, storing in localStorage");
      localStorage.setItem("token", data.token);
      console.log("Redirecting to dashboard");
      window.location.href = "dashboard.html";
    } else {
      alert(data.msg || "Login failed");
    }
  })
  .catch(err => {
    console.error("Login error:", err);
    if (err.message === "Failed to fetch") {
      alert("❌ Network Error: Cannot reach backend server\n\nMake sure:\n1. Backend is running (cd backend && node server.js)\n2. Port 5000 is not blocked\n3. Check browser console for details");
    } else {
      alert("❌ Error: " + err.message);
    }
  });
}

function register() {
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const role = document.getElementById("regRole").value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  fetch(API + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Registration successful! Redirecting to dashboard...");
      window.location.href = "dashboard.html";
    } else {
      alert(data.msg || "Registration failed");
    }
  })
  .catch(err => {
    console.error("Register error:", err);
    if (err.message === "Failed to fetch") {
      alert("Error: Cannot connect to server. Make sure the backend is running at http://localhost:5000");
    } else {
      alert("Error: " + err.message);
    }
  });
}

// ===== BLOCKCHAIN ORDER FUNCTIONS =====
function getAuthToken() {
  return localStorage.getItem("token");
}

function createOrder() {
  const customerId = document.getElementById("customerId").value;
  const productName = document.getElementById("productName").value;
  const productId = document.getElementById("productId").value;
  const quantity = document.getElementById("quantity").value;

  if (!customerId || !productName || !productId || !quantity) {
    alert("Please fill all fields");
    return;
  }

  console.log("Creating order with data:", { customerId, productName, productId, quantity });

  fetch(API + "/orders/create", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getAuthToken()
    },
    body: JSON.stringify({ customerId, productName, productId, quantity })
  })
  .then(res => {
    console.log("Create order response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Create order response data:", data);
    if (data.msg && data.order && data.order.orderId) {
      alert("✅ Order Created!\nOrder ID: " + data.order.orderId + "\nBlockchain Hash: " + (data.blockchainHash || "").substring(0, 32) + "...");
      document.getElementById("customerId").value = "";
      document.getElementById("productName").value = "";
      document.getElementById("productId").value = "";
      document.getElementById("quantity").value = "";
      loadOrders();
    } else {
      alert("Error: " + (data.msg || "Unknown error"));
    }
  })
  .catch(err => {
    console.error("Create order error:", err);
    if (err.message === "Failed to fetch") {
      alert("Error: Cannot connect to server. Make sure the backend is running at http://localhost:5000");
    } else {
      alert("Error: " + err.message);
    }
  });
}

function loadOrders() {
  fetch(API + "/orders", {
    headers: { "Authorization": "Bearer " + getAuthToken() }
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Orders data received:", data);
    
    // Handle both array response and object with orders property
    let orders = Array.isArray(data) ? data : (data.orders || []);
    
    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      orders = [];
    }
    
    let html = "<table style='width:100%; border-collapse: collapse;'>";
    html += "<tr style='background:#ddd;'><th>Order ID</th><th>Product</th><th>Status</th><th>Action</th></tr>";
    
    if (!orders || orders.length === 0) {
      html += "<tr><td colspan='4' style='text-align: center; padding: 20px;'>No orders yet</td></tr>";
    } else {
      orders.forEach((order, index) => {
        try {
          if (order && order.orderId) {
            html += `<tr style='border:1px solid #ddd;'>
              <td>${order.orderId}</td>
              <td>${order.productName || 'N/A'}</td>
              <td><strong style='color:${getStatusColor(order.status)}'>${order.status || 'pending'}</strong></td>
              <td><button onclick="loadOrderDetails('${order.orderId}')">View</button></td>
            </tr>`;
          }
        } catch (err) {
          console.log("Error processing order at index " + index, err);
        }
      });
    }
    html += "</table>";
    document.getElementById("orderList").innerHTML = html;
  })
  .catch(err => {
    console.error("Error loading orders:", err);
    document.getElementById("orderList").innerHTML = "<p style='color: red;'>Error loading orders: " + err.message + ". Please refresh and try again.</p>";
  });
}

function getStatusColor(status) {
  const colors = {
    pending: "#ff9800",
    packed: "#2196F3",
    dispatched: "#1976d2",
    "in-transit": "#4CAF50",
    "out-for-delivery": "#FF5722",
    delivered: "#8BC34A"
  };
  return colors[status] || "#999";
}

function loadOrderDetails(orderId) {
  currentOrderId = orderId;
  console.log("Loading order details for:", orderId);
  
  fetch(API + "/orders/" + orderId, {
    headers: { "Authorization": "Bearer " + getAuthToken() }
  })
  .then(res => {
    console.log("Order details response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Order details data:", data);
    if (!data || !data.order) {
      alert("Error: Invalid order data received");
      console.error("Invalid order data structure:", data);
      return;
    }
    
    const order = data.order;
    
    // Show order details card
    document.getElementById("orderDetailsCard").style.display = "block";
    
    // Status Timeline
    const statuses = ["pending", "packed", "dispatched", "in-transit", "out-for-delivery", "delivered"];
    let timelineHTML = "";
    statuses.forEach(s => {
      const isActive = s === order.status || (statuses.indexOf(order.status || "pending") > statuses.indexOf(s));
      timelineHTML += `<div class="status-step ${isActive ? 'active' : ''}">${s}</div>`;
    });
    document.getElementById("statusTimeline").innerHTML = timelineHTML;
    
    // Order Info
    let infoHTML = `
      <p><strong>Order ID:</strong> ${order.orderId || 'N/A'}</p>
      <p><strong>Customer ID:</strong> ${order.customerId || 'N/A'}</p>
      <p><strong>Product:</strong> ${order.productName || 'N/A'} (${order.productId || 'N/A'})</p>
      <p><strong>Quantity:</strong> ${order.quantity || 'N/A'}</p>
      <p><strong>Created:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
      <p><strong>GPS Tracker ID:</strong> ${order.gpsTrackerId || "Not assigned"}</p>
      ${order.deliveredAt ? `<p><strong>Delivered:</strong> ${new Date(order.deliveredAt).toLocaleString()}</p>` : ""}
    `;
    document.getElementById("orderInfo").innerHTML = infoHTML;
    
    // Blockchain Info
    document.getElementById("blockchainHash").innerText = order.blockchainHash || 'N/A';
    document.getElementById("transactionId").innerText = order.transactionId || 'N/A';
    
    // QR Code
    if (order.qrCode && order.qrCode.data) {
      document.getElementById("qrcode").innerHTML = "";
      new QRCode(document.getElementById("qrcode"), {
        text: order.qrCode.data,
        width: 150,
        height: 150
      });
    } else {
      document.getElementById("qrcode").innerHTML = "<p style='color: #999;'>QR code not yet generated</p>";
    }
    
    // GPS Map
    const gpsHistory = data.gpsHistory || [];
    displayGPSMap(gpsHistory);
    
    // GPS History
    let gpsHTML = "<h4>Location History:</h4>";
    if (gpsHistory && gpsHistory.length > 0) {
      gpsHistory.forEach((loc, i) => {
        if (loc && loc.latitude && loc.longitude) {
          gpsHTML += `<p>📍 #${i+1}: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)} - ${loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString() : 'N/A'}</p>`;
        }
      });
    } else {
      gpsHTML += "<p style='color: #999;'>No GPS data yet</p>";
    }
    document.getElementById("gpsHistory").innerHTML = gpsHTML;
    
    // Show action buttons based on status
    document.getElementById("dispatchSection").style.display = order.status === "pending" ? "block" : "none";
    document.getElementById("locationUpdateSection").style.display = 
      (order.status === "dispatched" || order.status === "in-transit") ? "block" : "none";
    document.getElementById("deliverySection").style.display = 
      order.status === "out-for-delivery" ? "block" : "none";
    
    // Blockchain History
    const blockchainHistory = data.blockchainHistory || [];
    let blockchainHTML = "<ul>";
    if (blockchainHistory && blockchainHistory.length > 0) {
      blockchainHistory.forEach(tx => {
        if (tx && tx.eventType && tx.transactionId) {
          blockchainHTML += `<li>
            <strong>${tx.eventType}</strong> - ${tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}<br>
            TX: ${tx.transactionId.substring(0, 16)}...
          </li>`;
        }
      });
    } else {
      blockchainHTML += "<li>No blockchain history yet</li>";
    }
    blockchainHTML += "</ul>";
    document.getElementById("blockchainHistory").innerHTML = blockchainHTML;
    
    // Scroll to details
    document.getElementById("orderDetailsCard").scrollIntoView({ behavior: "smooth" });
  })
  .catch(err => {
    console.error("Error loading order details:", err);
    alert("Error loading order: " + err.message);
  });
}

function dispatchOrder() {
  const gpsTrackerId = document.getElementById("gpsTrackerId").value || "AUTO-" + Math.random().toString(36).substr(2, 9);
  
  fetch(API + "/orders/dispatch/" + currentOrderId, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getAuthToken()
    },
    body: JSON.stringify({ gpsTrackerId })
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Order Dispatched!\nGPS Tracker: " + data.gpsTrackerId);
    loadOrderDetails(currentOrderId);
  })
  .catch(err => alert("Error: " + err));
}

function submitLocation() {
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);
  
  if (!latitude || !longitude) {
    alert("Please enter valid coordinates");
    return;
  }

  fetch(API + "/orders/location/" + currentOrderId, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getAuthToken()
    },
    body: JSON.stringify({ latitude, longitude, gpsTrackerId: "GPS-" + Math.random().toString(36).substr(2, 9) })
  })
  .then(res => res.json())
  .then(data => {
    alert("📍 Location recorded on blockchain!");
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
    loadOrderDetails(currentOrderId);
  })
  .catch(err => alert("Error: " + err));
}

function markDelivered() {
  const deliveryProof = document.getElementById("deliveryProof").value || "Verified";
  
  fetch(API + "/orders/deliver/" + currentOrderId, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getAuthToken()
    },
    body: JSON.stringify({ deliveryProof })
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Order Delivered!\n" + data.verificationUrl);
    loadOrderDetails(currentOrderId);
  })
  .catch(err => alert("Error: " + err));
}

function displayGPSMap(gpsHistory) {
  const mapDiv = document.getElementById("locationMap");
  if (!gpsHistory || gpsHistory.length === 0) {
    mapDiv.innerHTML = "<p style='text-align:center; color:#999;'>No GPS data available</p>";
    return;
  }

  try {
    // Filter valid GPS entries
    const validGPS = gpsHistory.filter(loc => loc && loc.latitude && loc.longitude);
    
    if (validGPS.length === 0) {
      mapDiv.innerHTML = "<p style='text-align:center; color:#999;'>No valid GPS data available</p>";
      return;
    }

    // Simple map visualization
    mapDiv.innerHTML = "";
    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = mapDiv.clientWidth;
    mapCanvas.height = 400;
    mapDiv.appendChild(mapCanvas);

    const ctx = mapCanvas.getContext("2d");
    
    // Find bounds
    const lats = validGPS.map(l => l.latitude);
    const lons = validGPS.map(l => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const padding = 40;
    const scale = 0.9;

    validGPS.forEach((loc, i) => {
      const x = padding + (loc.longitude - minLon) / (maxLon - minLon) * (mapCanvas.width - 2 * padding) * scale;
      const y = padding + (loc.latitude - minLat) / (maxLat - minLat) * (mapCanvas.height - 2 * padding) * scale;
      
      // Draw point
      ctx.fillStyle = i === validGPS.length - 1 ? "#4CAF50" : "#FF9800";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw line to next point
      if (i < validGPS.length - 1) {
        const nextLoc = validGPS[i + 1];
        const nextX = padding + (nextLoc.longitude - minLon) / (maxLon - minLon) * (mapCanvas.width - 2 * padding) * scale;
        const nextY = padding + (nextLoc.latitude - minLat) / (maxLat - minLat) * (mapCanvas.height - 2 * padding) * scale;
        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }
    });

    // Draw labels
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.fillText("Start", padding - 20, padding - 10);
    ctx.fillText("Current", mapCanvas.width - 60, mapCanvas.height - 20);
  } catch (err) {
    console.log("GPS Map Error:", err);
    mapDiv.innerHTML = "<p style='text-align:center; color:red;'>Error rendering map</p>";
  }
}

// ===== DEBUG & HELPER FUNCTIONS =====

// Function to manually test connection
function manualConnectionTest() {
  console.clear();
  console.log("%c🔧 Manual Connection Test", "color: blue; font-weight: bold; font-size: 16px;");
  console.log("%c========================================", "color: blue;");
  console.log(`Current API: ${API}`);
  console.log(`Server Connected: ${serverConnected ? '✅ Yes' : '❌ No'}`);
  console.log(`Browser Hostname: ${window.location.hostname}`);
  console.log(`Protocol: ${window.location.protocol}`);
  console.log("%c========================================", "color: blue;");
  console.log("%cTo fix 'Failed to fetch' error:", "color: orange; font-weight: bold;");
  console.log("%c1. Open new terminal", "color: orange;");
  console.log("%c2. Run: cd backend && node server.js", "color: orange;");
  console.log("%c3. Wait for 'Server running on port 5000'", "color: orange;");
  console.log("%c4. Refresh this page", "color: orange;");
  testAPIConnection();
}

// Add this to window so it can be called from console
window.testConnection = manualConnectionTest;
window.getAPIStatus = () => ({
  connected: serverConnected,
  endpoint: API,
  config: API_CONFIG
});

// Load orders when on dashboard
if (location.pathname.includes("dashboard")) {
  loadOrders();
  setInterval(loadOrders, 5000); // Refresh every 5 seconds
}
