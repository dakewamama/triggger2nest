#!/bin/bash
echo "🚀 Starting Pump Fun Application..."

# Start backend
echo "Starting backend..."
npm run start:dev &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Start frontend
echo "Starting frontend..."
cd pump-fun-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Application started!"
echo "📌 Frontend: http://localhost:5173"
echo "📌 Backend:  http://localhost:3000"
echo "📌 Press Ctrl+C to stop"

# Keep running
wait $BACKEND_PID $FRONTEND_PID
