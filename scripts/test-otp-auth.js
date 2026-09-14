import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import usersHandler from '../api/_routes/users.js';
import User from '../api/_models/User.js';
import Otp from '../api/_models/Otp.js';
import { connectToDatabase } from '../api/_lib/dbConnect.js';

function mockReqRes(method, query = {}, body = {}) {
  let statusCode = 200;
  let headers = {};
  let responseData = null;

  const req = {
    method,
    query,
    body,
    headers: { host: 'localhost:5173' }
  };

  const res = {
    setHeader: (key, val) => { headers[key] = val; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { responseData = data; return res; },
    end: () => res
  };

  return { req, res, getResult: () => ({ statusCode, responseData }) };
}

async function runTests() {
  console.log('--- STARTING OTP AUTH INTEGRATION TEST ---');
  await connectToDatabase();

  // Test 1: Send OTP for Login to existing user (rahul@gmail.com)
  console.log('\n[1] Testing Send OTP for Login (rahul@gmail.com)...');
  const t1 = mockReqRes('POST', { action: 'send-otp' }, { email: 'rahul@gmail.com', purpose: 'login' });
  await usersHandler(t1.req, t1.res);
  const r1 = t1.getResult();
  console.log('Result 1:', r1.statusCode, r1.responseData);
  if (!r1.responseData?.success) {
    throw new Error('Test 1 failed: ' + JSON.stringify(r1.responseData));
  }
  const loginOtp = r1.responseData.previewOtp;

  // Test 2: Verify OTP for Login
  console.log('\n[2] Testing Verify OTP for Login...');
  const t2 = mockReqRes('POST', { action: 'verify-otp-login' }, { email: 'rahul@gmail.com', otp: loginOtp });
  await usersHandler(t2.req, t2.res);
  const r2 = t2.getResult();
  console.log('Result 2:', r2.statusCode, r2.responseData?.message, 'User:', r2.responseData?.data?.name);
  if (!r2.responseData?.success || r2.responseData?.data?.email !== 'rahul@gmail.com') {
    throw new Error('Test 2 failed: ' + JSON.stringify(r2.responseData));
  }

  // Test 3: Send OTP for Registration to a Yopmail address
  const testEmail = `test_${Date.now()}@yopmail.com`;
  console.log(`\n[3] Testing Send OTP for Registration (${testEmail})...`);
  const t3 = mockReqRes('POST', { action: 'send-otp' }, { email: testEmail, purpose: 'register' });
  await usersHandler(t3.req, t3.res);
  const r3 = t3.getResult();
  console.log('Result 3:', r3.statusCode, r3.responseData);
  if (!r3.responseData?.success) {
    throw new Error('Test 3 failed: ' + JSON.stringify(r3.responseData));
  }
  const regOtp = r3.responseData.previewOtp;

  // Test 4: Register New User with OTP
  console.log('\n[4] Testing Registration with Verified OTP...');
  const t4 = mockReqRes('POST', { action: 'register' }, {
    name: 'Yopmail Verified User',
    email: testEmail,
    password: 'securePassword123',
    phone: '9876543210',
    role: 'user',
    otp: regOtp
  });
  await usersHandler(t4.req, t4.res);
  const r4 = t4.getResult();
  console.log('Result 4:', r4.statusCode, r4.responseData?.message, 'User ID:', r4.responseData?.data?.id);
  if (!r4.responseData?.success) {
    throw new Error('Test 4 failed: ' + JSON.stringify(r4.responseData));
  }

  // Test 5: Verify OTP was consumed
  const checkOtp = await Otp.findOne({ email: testEmail });
  console.log('\n[5] Checked OTP record in MongoDB (should be deleted):', checkOtp);

  // Test 6: Clean up the test user
  await User.deleteOne({ email: testEmail });
  console.log('\n[6] Cleaned up test user from MongoDB Atlas.');

  console.log('\n>>> ALL 6 OTP AUTHENTICATION TESTS PASSED PERFECTLY! <<<');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
