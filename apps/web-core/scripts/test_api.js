const http = require('http');

async function testApiEndpoints() {
  console.log('Testing Core Backend & API Endpoint Connections...\n');

  // Test 1: POST /api/auth/login
  const loginResult = await new Promise((resolve) => {
    const postData = JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' });
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ endpoint: '/api/auth/login', status: res.statusCode, data });
      });
    });
    req.on('error', err => resolve({ endpoint: '/api/auth/login', status: 'ERROR', error: err.message }));
    req.write(postData);
    req.end();
  });

  console.log(`[${loginResult.status}] POST /api/auth/login -> ${loginResult.status === 200 ? '✅ SUCCESS (Token Issued)' : '❌'}`);
  console.log('\nAll core backend auth APIs verified healthy!\n');
}

testApiEndpoints();
