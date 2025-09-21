#!/bin/bash
echo "🚀 Starting TRIGGER2NEST in production mode..."

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Start backend (serves frontend too)
echo "📡 Starting production server..."
npm run start:prod
