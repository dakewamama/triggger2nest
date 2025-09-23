#!/bin/bash
echo "🏗️  Building for Production"
echo "=========================="

# Build backend
echo "📦 Building backend..."
npm run build

# Build frontend
echo "📦 Building frontend..."
npm run build:frontend

echo "✅ Production build complete!"
echo ""
echo "To start production:"
echo "  Backend: npm run start:prod (port 8000)"
