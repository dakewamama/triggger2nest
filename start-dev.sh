#!/bin/bash
echo "🚀 Starting Development Environment"
echo "==================================="
echo "Backend: Port 8000"
echo "Frontend: Port 5173"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "🔧 Starting backend on port 8000..."
echo "⚛️  Starting frontend on port 5173..."
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:5173"
echo ""

# Start both services
npm run dev:all
