const http = require('http');

async function testMigrationDirect() {
  console.log('Testing live CRM ingestion directly from Migration module:');

  // Test 1: Ingest contact to :3001
  const contactData = JSON.stringify({
    firstName: 'Migration',
    lastName: 'TestUser',
    email: 'migration.test@salesforce-import.io',
    phone: '+1 555-0199'
  });

  const req1 = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/contacts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(contactData),
      'x-tenant-id': 'default-tenant'
    }
  }, (res) => {
    console.log(`[Contacts :3001] -> Status ${res.statusCode}`);
  });
  req1.write(contactData);
  req1.end();

  // Test 2: Ingest deal to :3005
  const dealData = JSON.stringify({
    title: 'Salesforce Enterprise Import Deal',
    amount: 125000,
    stage: 'Qualified'
  });

  const req2 = http.request({
    hostname: 'localhost',
    port: 3005,
    path: '/deals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dealData),
      'x-tenant-id': 'default-tenant'
    }
  }, (res) => {
    console.log(`[Deals :3005] -> Status ${res.statusCode}`);
  });
  req2.write(dealData);
  req2.end();
}

testMigrationDirect();
