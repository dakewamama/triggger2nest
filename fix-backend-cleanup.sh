#!/bin/bash

echo "🔧 FIXING DEPENDENCIES AFTER CRASH"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Cleaning up corrupted modules...${NC}"
rm -rf node_modules/
rm -f package-lock.json

echo -e "${YELLOW}Step 2: Clearing npm cache...${NC}"
npm cache clean --force

echo -e "${YELLOW}Step 3: Installing dependencies fresh...${NC}"
npm install

echo -e "${YELLOW}Step 4: Installing missing glob package explicitly...${NC}"
npm install --save-dev glob

echo -e "${YELLOW}Step 5: Ensuring all NestJS CLI dependencies are installed...${NC}"
npm install --save-dev @nestjs/cli@10.0.0

echo -e "${YELLOW}Step 6: Fixing main.ts to use port 8000...${NC}"
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // EXPLICITLY USE PORT 8000
  const port = 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
EOF

echo -e "${YELLOW}Step 7: Creating .env file with PORT=8000...${NC}"
cat > .env << 'EOF'
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

echo -e "${YELLOW}Step 8: Testing if NestJS CLI works...${NC}"
npx nest --version

echo ""
echo -e "${GREEN}✅ Dependencies fixed!${NC}"
echo "====================="
echo ""
echo "Now try running:"
echo "  npm run start:dev"
echo ""
echo "Backend should run on port 8000"
echo ""
echo "If you still get errors, try:"
echo "  npx nest start --watch"
echo "Or directly:"
echo "  npx ts-node src/main.ts"