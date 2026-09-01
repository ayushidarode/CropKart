# CropKart Development Server Starter Script

Write-Host "🌾 Starting CropKart Development Environment..." -ForegroundColor Green
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Start Backend
Write-Host "Starting Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd backend && npm start"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd frontend && npx vite"

Write-Host ""
Write-Host "✅ Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Farmer: ramesh@example.com / password123" -ForegroundColor White
Write-Host "  Buyer:  buyer@example.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Press any key in the terminal windows to stop the servers" -ForegroundColor Cyan
