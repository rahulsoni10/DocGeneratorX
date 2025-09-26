@echo off
echo Starting Agentic Pharma Demo...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd back-end && python test_server.py"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd front-end && npm run dev"

echo.
echo Demo is starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
