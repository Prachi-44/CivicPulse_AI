$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptDir) { $scriptDir = "D:\IBM Coursera\CivicPulse-AI" }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CIVICPULSE AI - URBAN INTELLIGENCE HUB (PUNE METRO)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting Python Flask AI Microservice on Port 5001..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$scriptDir\ai-service`" && python app.py"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Express REST API Backend on Port 4000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$scriptDir\backend`" && npm run dev"

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Vite React Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$scriptDir\frontend`" && npm run dev"

Write-Host "`nAll services initiated successfully!" -ForegroundColor Green
Write-Host "Frontend App:     http://localhost:5173" -ForegroundColor White
Write-Host "Backend REST API: http://localhost:4000/api" -ForegroundColor White
Write-Host "AI Microservice:  http://localhost:5001" -ForegroundColor White
Write-Host "`nDefault Demo Accounts:" -ForegroundColor Magenta
Write-Host "  * Authority Admin: admin@civicpulse.in / Admin@2025" -ForegroundColor Gray
Write-Host "  * Supervisor QRT:  supervisor@civicpulse.in / Admin@2025" -ForegroundColor Gray
Write-Host "  * Citizen Resident: aditya@example.com / Citizen@2025" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
