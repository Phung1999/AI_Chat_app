@echo off
title ChatApp Backend
cd /d "%~dp0backend"

echo Installing dependencies...
call npm install

echo.
echo Starting Backend Server...
echo Server running at: http://localhost:3000
echo Press Ctrl+C to stop
echo.

npm start

pause