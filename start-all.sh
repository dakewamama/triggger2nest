#!/bin/bash

echo "🔧 Fixing NPM dependency issues..."

# Option 1: Clear npm cache and try again
echo "1️⃣ Clearing npm cache..."
npm cache clean --force

# Option 2: Delete node_modules and package-lock.json
echo "2️⃣ Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Option 3: Fresh install
echo "3️⃣ Fresh npm install..."
npm install

# Option 4: Install specific versions that work
echo "4️⃣ Installing required dependencies with specific versions..."

# Install core NestJS axios
npm install @nestjs/axios@3.0.2

# Install axios
npm install axios@1.6.8

# Install tsconfig-paths with correct version
npm install tsconfig-paths@4.1.2

echo "✅ Dependencies should be fixed!"
echo ""
echo "🧪 Test your backend:"
echo "npm run start:dev"