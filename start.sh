#!/bin/bash

echo ""
echo "================================================"
echo "   Supply Smart Chain - Development Server"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "Starting backend and frontend servers..."
echo ""

# Start backend server in background
echo "[1/2] Starting Backend Server (Port 5000)..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend server
echo "[2/2] Starting Frontend Server (Port 3000)..."
node frontend-server.js &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "   Servers Started Successfully!"
echo "================================================"
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo "================================================"
echo ""

# Keep the script running
wait
