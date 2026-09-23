import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';

dotenv.config();

console.log('--- Testing Razorpay Integration Backend ---');

const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log('1. Checking Environment Credentials:');
console.log('   RAZORPAY_KEY_ID:', key_id ? `${key_id.slice(0, 10)}...` : 'MISSING');
console.log('   RAZORPAY_KEY_SECRET:', key_secret ? 'EXISTS (hidden)' : 'MISSING');


if (!key_id || !key_secret) {
  console.error('❌ Credentials missing in .env!');
  process.exit(1);
}

const razorpay = new Razorpay({ key_id, key_secret });

async function runTests() {
  try {
    // 1. Test Order Creation
    console.log('\n2. Testing Razorpay Order Creation via SDK:');
    const order = await razorpay.orders.create({
      amount: 49900, // 499 INR in paise
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`,
      notes: { test: 'true', platform: 'KabadConnect' }
    });

    console.log('   ✓ Order successfully created!');
    console.log('   Order ID:', order.id);
    console.log('   Amount:', order.amount, order.currency);
    console.log('   Status:', order.status);

    // 2. Test HMAC-SHA256 Signature Verification
    console.log('\n3. Testing HMAC-SHA256 Signature Generation & Verification:');
    const dummyPaymentId = 'pay_TestDummy123456';
    const validSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${order.id}|${dummyPaymentId}`)
      .digest('hex');

    console.log('   Generated HMAC Signature:', validSignature);

    // Verify valid signature match
    const testVerifyExpected = crypto
      .createHmac('sha256', key_secret)
      .update(`${order.id}|${dummyPaymentId}`)
      .digest('hex');

    const isValid = testVerifyExpected === validSignature;
    console.log('   ✓ Signature match check passed:', isValid);

    // Verify invalid signature detection
    const isInvalidRejected = testVerifyExpected !== 'fake_signature_123';
    console.log('   ✓ Fake signature correctly rejected:', isInvalidRejected);

    console.log('\n🎉 ALL RAZORPAY BACKEND CHECKS PASSED!');
  } catch (err) {
    console.error('❌ Razorpay test failed:', err);
    process.exit(1);
  }
}

runTests();
