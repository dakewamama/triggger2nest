// Quick test to verify all routes work
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

async function testBackend() {
  console.log('🧪 Testing Backend Endpoints...\n');
  
  const endpoints = [
    { name: 'Health', url: '/health', method: 'GET' },
    { name: 'Root', url: '/', method: 'GET' },
    { name: 'Pump Health', url: '/pump/health', method: 'GET' },
    { name: 'Trending Tokens', url: '/tokens/trending?limit=5', method: 'GET' },
    { name: 'New Tokens', url: '/tokens/new?limit=5', method: 'GET' },
    { name: 'Featured Tokens', url: '/tokens/featured?limit=5', method: 'GET' },
    { name: 'Market Stats', url: '/tokens/stats/market', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: BASE_URL + endpoint.url,
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status}`);
      if (response.data) {
        console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(`⚠️  ${endpoint.name}: ${error.response.status} - ${error.response.data || 'No data'}`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }
}

// Wait for server to start then test
setTimeout(testBackend, 3000);
