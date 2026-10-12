const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { tenantId: 'clm0abc123', userId: 'user123' },
  process.env.JWT_SECRET || 'test-secure-256bit-automated-verification-secret-xyz123',
  { expiresIn: '1h' }
);

async function test() {
  console.log("Creating Custom Object...");
  const res = await fetch('http://localhost:3008/custom-objects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Product",
      pluralName: "Products",
      apiName: "product",
      description: "A product in the catalog",
      fields: [
        { name: "Price", apiName: "price", fieldType: "NUMBER", isRequired: true },
        { name: "Active", apiName: "active", fieldType: "BOOLEAN", isRequired: false }
      ]
    })
  });
  
  const obj = await res.json();
  console.log("Custom Object Response:", obj);
  
  if (!obj.id) return;

  console.log("\nCreating Custom Record...");
  const recRes = await fetch(`http://localhost:3008/custom-records/${obj.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        price: 99.99,
        active: true
      }
    })
  });
  
  const rec = await recRes.json();
  console.log("Custom Record Response:", rec);
  
  console.log("\nFetching Records...");
  const listRes = await fetch(`http://localhost:3008/custom-records/${obj.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Records:", await listRes.json());
}

test();
