#!/bin/bash
echo "🚀 Starting TRIGGER2NEST in development mode..."

# Check if ports are available
if lsof -i :3000 > /dev/null 2>&1; then
    echo "❌ Port 3000 is already in use"
    exit 1
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo "❌ Port 5173 is already in use"  
    exit 1
fi

# Start backend
echo "📡 Starting backend server..."
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully"
echo "🌐 Backend: http://localhost:3000"
echo "📋 API Health: http://localhost:3000/health"
echo ""
echo "To start frontend: cd frontend && npm run dev"
echo "Or run: npm run dev:frontend"
echo ""
echo "Press Ctrl+C to stop"

# Keep backend running
wait $BACKEND_PID
