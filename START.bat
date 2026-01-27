@echo off
echo.
echo ================================================
echo   Supply Smart Chain - Development Server
echo ================================================
echo.
echo Starting backend and frontend servers...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Start backend server in a new window
echo [1/2] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k cd backend ^& node server.js

REM Start frontend server in a new window
timeout /t 2 /nobreak
echo [2/2] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k node frontend-server.js

echo.
echo ================================================
echo   Servers Started Successfully!
echo ================================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:5000
echo.
echo Close the command windows to stop the servers
echo ================================================
echo.
pause
