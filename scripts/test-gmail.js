import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { sendOtpEmail } from '../api/_lib/emailService.js';

async function testGmail() {
  console.log('Testing Gmail OTP Dispatch with configured credentials:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD exists:', Boolean(process.env.GMAIL_APP_PASSWORD));

  const testOtp = '582914';
  const targetEmail = process.env.GMAIL_USER || 'yogesh.albiorix@gmail.com';

  console.log(`Sending live OTP (${testOtp}) to ${targetEmail}...`);
  const result = await sendOtpEmail({
    to: targetEmail,
    otp: testOtp,
    purpose: 'login'
  });

  console.log('\nResult:', result);
  if (result.delivered) {
    console.log('\n🎉 SUCCESS! Real email was dispatched to Gmail inbox successfully!');
  } else {
    console.log('\n⚠️ Notice:', result);
  }
}

testGmail().catch(console.error);
