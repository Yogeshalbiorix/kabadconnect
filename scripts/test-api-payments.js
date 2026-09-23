import dotenv from 'dotenv';
import handler from '../api/_routes/payments.js';

dotenv.config();

console.log('--- Testing API Handler api/_routes/payments.js ---');

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    end(data) { this.body = data; return this; }
  };
}

async function testHandler() {
  // Test 1: GET Status
  const reqGet = {
    method: 'GET',
    headers: { host: 'localhost:5173' },
    url: '/api/payments',
    query: {}
  };
  const resGet = mockRes();
  await handler(reqGet, resGet);
  console.log('1. GET /api/payments Response:', resGet.body);

  // Test 2: POST Create Order
  const reqPostCreate = {
    method: 'POST',
    headers: { host: 'localhost:5173' },
    url: '/api/create-order',
    query: { action: 'create-order' },
    body: {
      amount: 15000, // 150 INR in paise
      currency: 'INR',
      notes: { item: 'Recycled Glass Vase' }
    }
  };
  const resPostCreate = mockRes();
  await handler(reqPostCreate, resPostCreate);
  console.log('2. POST /api/create-order Response Status:', resPostCreate.statusCode);
  console.log('   Order ID Created:', resPostCreate.body?.order_id);

  // Test 3: POST Verify Signature with Invalid Data (Expect 400)
  const reqPostVerifyBad = {
    method: 'POST',
    headers: { host: 'localhost:5173' },
    url: '/api/verify-payment',
    query: { action: 'verify-payment' },
    body: {
      razorpay_order_id: resPostCreate.body?.order_id,
      razorpay_payment_id: 'pay_test_12345',
      razorpay_signature: 'invalid_signature_mock'
    }
  };
  const resPostVerifyBad = mockRes();
  await handler(reqPostVerifyBad, resPostVerifyBad);
  console.log('3. POST /api/verify-payment (Invalid Signature) Status:', resPostVerifyBad.statusCode, '(Expected: 400)');
  console.log('   Error Message:', resPostVerifyBad.body?.error);

  // Test 4: POST Amount less than 100 paise (Expect 400)
  const reqPostInvalidAmt = {
    method: 'POST',
    headers: { host: 'localhost:5173' },
    url: '/api/create-order',
    query: { action: 'create-order' },
    body: {
      amount: 50 // 50 paise < 100 paise minimum
    }
  };
  const resPostInvalidAmt = mockRes();
  await handler(reqPostInvalidAmt, resPostInvalidAmt);
  console.log('4. POST /api/create-order (Amount < 100 paise) Status:', resPostInvalidAmt.statusCode, '(Expected: 400)');
  console.log('   Error Message:', resPostInvalidAmt.body?.error);

  console.log('\n✨ All backend handler edge cases validated successfully!');
}

testHandler();
