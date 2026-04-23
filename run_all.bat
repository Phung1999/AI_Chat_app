@echo off
title ChatApp - All Services

echo ========================================
echo     ChatApp - Running All Services
echo ========================================
echo.

:: Start Backend
echo [1/2] Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm start"

:: Wait for backend to start
timeout /t 3 /nobreak > nul

:: Start Web App
echo [2/2] Starting Web App...
cd /d "%~dp0web_app"
start "Web App" cmd /k "npm run dev"

echo.
echo ========================================
echo  Services Started:
echo  - Backend:  http://localhost:3000
echo  - Web App:  http://localhost:5173
echo ========================================
echo  Press any key to close this window...
echo ========================================

pause > nul