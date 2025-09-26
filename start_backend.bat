@echo off
echo Starting Agentic Pharma Backend (Local Development)
echo.

echo Installing dependencies...
cd back-end
pip install -r requirements-dev.txt

echo.
echo Starting backend server...
python run_local.py

pause
