#!/bin/bash

echo "Starting Agentic Pharma Demo..."
echo

echo "Starting Backend Server..."
cd back-end
python test_server.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Server..."
cd ../front-end
npm run dev &
FRONTEND_PID=$!

echo
echo "Demo is starting up!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
