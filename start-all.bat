@echo off
title CivicPulse AI Launcher
echo ==========================================================
echo    CIVICPULSE AI - URBAN INTELLIGENCE HUB (PUNE METRO)    
echo ==========================================================

echo [1/3] Starting Python Flask AI Microservice on Port 5001...
start "CivicPulse AI Microservice (5001)" cmd /k "cd /d "%~dp0ai-service" && python app.py"

ping -n 3 127.0.0.1 > nul

echo [2/3] Starting Express REST API Backend on Port 4000...
start "CivicPulse Backend API (4000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

ping -n 3 127.0.0.1 > nul

echo [3/3] Starting Vite React Frontend on Port 5173...
start "CivicPulse Frontend (5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================================
echo  All 3 services launched in dedicated terminal windows!
echo  - Frontend Web UI: http://localhost:5173
echo  - Backend API:     http://localhost:4000/api
echo  - AI Microservice: http://localhost:5001
echo.
echo  Demo Credentials:
echo  - Authority:  admin@civicpulse.in / Admin@2025
echo  - Supervisor: supervisor@civicpulse.in / Admin@2025
echo  - Citizen:    aditya@example.com / Citizen@2025
echo ==========================================================
