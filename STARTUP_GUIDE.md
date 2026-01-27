# Supply Smart Chain - Quick Start Guide

## ⚠️ Important: Server Setup Required

The application requires **both a backend and frontend server** to run. Opening the HTML file directly in the browser (`file://`) will NOT work.

## Step 1: Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
```

## Step 2: Start the Servers

### Windows Users
Double-click `START.bat` in the project root folder

Or run in PowerShell/Command Prompt:
```bash
# Terminal 1 - Backend Server (Port 5000)
cd backend
node server.js

# Terminal 2 - Frontend Server (Port 3000)
node ..\frontend-server.js
```

### Mac/Linux Users
```bash
# Give execute permission (first time only)
chmod +x start.sh

# Run the script
./start.sh
```

Or manually:
```bash
# Terminal 1 - Backend Server (Port 5000)
cd backend
node server.js

# Terminal 2 - Frontend Server (Port 3000)
cd ..
node frontend-server.js
```

## Step 3: Open in Browser

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 📋 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Customer Account:**
- Username: `customer`
- Password: `pass123`

## ❌ Common Issues

### Error: "TypeError: Failed to fetch"
- **Cause**: You're opening the file with `file://` protocol or backend is not running
- **Fix**: Use the START script or run servers manually as shown above

### Port Already in Use
- Backend: Change port in `backend/server.js`
- Frontend: Change port in `frontend-server.js`

### Node/npm not found
- Install Node.js from https://nodejs.org

## 📝 File Structure

```
├── index.html              ✅ Main login page (root)
├── dashboard.html          ✅ Dashboard page (root)
├── style.css               ✅ Styles (root)
├── script.js               ✅ Frontend logic (root)
├── frontend-server.js      ✅ Frontend web server
├── backend/
│   ├── server.js          ✅ Backend API server
│   ├── package.json
│   └── routes/
│       ├── auth.js        ✅ Authentication routes
│       └── order.js       ✅ Order management routes
└── frontend/              (Legacy - use root files instead)
```

## 🚀 Deployment to Vercel

For Vercel deployment, the root-level `index.html` will be automatically served.

For backend, deploy `backend/` separately to a service like:
- Railway
- Render
- Heroku
- AWS

Then update the API URL in `script.js` to point to your deployed backend.

## 📞 Support

If you encounter issues:
1. Check that both servers are running on ports 3000 and 5000
2. Check browser console for error messages
3. Ensure Node.js is installed: `node -v`
