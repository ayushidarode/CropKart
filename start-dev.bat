@echo off
echo 🌾 Starting CropKart...
echo.

cd "%~dp0"

echo Starting Backend (http://localhost:5000)...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo Starting Frontend (http://localhost:3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers started!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Demo Credentials:
echo - Farmer: ramesh@example.com / password123
echo - Buyer: buyer@example.com / password123
echo - Transporter: transporter@example.com / password123
