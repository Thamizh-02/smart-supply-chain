const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
  console.log('✅ Frontend server running on http://localhost:3000');
  console.log('   Open in browser: http://localhost:3000');
});
