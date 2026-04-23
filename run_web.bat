@echo off
title ChatApp Web
cd /d "%~dp0web_app"

echo Installing dependencies...
call npm install

echo.
echo Starting Web App...
echo Web running at: http://localhost:5173
echo Press Ctrl+C to stop
echo.

npm run dev

pause