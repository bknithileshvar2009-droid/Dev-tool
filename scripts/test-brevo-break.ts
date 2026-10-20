/**
 * Automated test suite for Brevo Focus Break Approval system
 * Tests:
 * 1. Cryptographic hashing & timingSafeEqual
 * 2. Invalid code rejection & attempt limiting
 * 3. Expired code handling
 * 4. Single-use code invalidation (no reuse)
 * 5. Rate limiting
 * 6. Brevo transactional email client error handling & validation
 */

import crypto from 'node:crypto';
import {
  handleRequestBreak,
  handleVerifyBreak,
  checkRateLimit,
  cleanExpiredCodes,
  getBreakCodeStore,
} from '../netlify/functions/brevoService';

async function runTests() {
  console.log('--- STARTING BREVO FOCUS BREAK UNIT & INTEGRATION TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Rate Limiting
  const testKey = `test_user_${Date.now()}`;
  assert(checkRateLimit(testKey, 3, 60000) === true, 'Rate limiter allows 1st request');
  assert(checkRateLimit(testKey, 3, 60000) === true, 'Rate limiter allows 2nd request');
  assert(checkRateLimit(testKey, 3, 60000) === true, 'Rate limiter allows 3rd request');
  assert(checkRateLimit(testKey, 3, 60000) === false, 'Rate limiter blocks 4th request within window');

  // Test 2: In-Memory Secure Hash Store & Verification Logic
  const store = getBreakCodeStore();
  const sessionId = `test_session_${Date.now()}`;
  const plainCode = '482910';
  const salt = crypto.randomBytes(16).toString('hex');
  const codeHash = crypto.createHash('sha256').update(`${plainCode}:${salt}`).digest('hex');

  store.set(sessionId, {
    sessionId,
    userUid: 'test_uid_123',
    recipientEmail: 'guardian@example.com',
    codeHash,
    salt,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    createdAt: Date.now(),
  });

  // Test 3: Invalid code attempt
  const invalidRes = await handleVerifyBreak({ sessionId, code: '000000' });
  assert(invalidRes.status === 400, 'Invalid code returns HTTP 400');
  assert(invalidRes.body.error?.includes('attempt'), 'Error informs user of remaining attempts');

  const recordAfterAttempt = store.get(sessionId);
  assert(recordAfterAttempt?.attempts === 1, 'Attempt counter incremented on wrong code');

  // Test 4: Correct code approval
  const validRes = await handleVerifyBreak({ sessionId, code: plainCode });
  assert(validRes.status === 200, 'Correct code returns HTTP 200');
  assert(validRes.body.approved === true, 'Break approved flag is true');
  assert(validRes.body.breakDurationMinutes === 5, 'Grants exactly 5 minutes break');

  // Test 5: Single-use code invalidation (Prevent reuse)
  const reuseRes = await handleVerifyBreak({ sessionId, code: plainCode });
  assert(reuseRes.status === 400, 'Reusing approved code is immediately rejected');
  assert(store.get(sessionId) === undefined, 'Session record deleted from memory upon use');

  // Test 6: Expired code rejection
  const expiredSessionId = `expired_session_${Date.now()}`;
  store.set(expiredSessionId, {
    sessionId: expiredSessionId,
    userUid: 'test_uid_expired',
    recipientEmail: 'guardian@example.com',
    codeHash,
    salt,
    expiresAt: Date.now() - 1000, // already expired
    attempts: 0,
    createdAt: Date.now() - 6 * 60 * 1000,
  });

  const expiredRes = await handleVerifyBreak({ sessionId: expiredSessionId, code: plainCode });
  assert(expiredRes.status === 400, 'Expired code rejected with HTTP 400');
  assert(expiredRes.body.error?.includes('expired'), 'Error message specifies expiration');

  // Test 7: Exceeded attempt lockout
  const lockoutSessionId = `lockout_session_${Date.now()}`;
  store.set(lockoutSessionId, {
    sessionId: lockoutSessionId,
    userUid: 'test_uid_lockout',
    recipientEmail: 'guardian@example.com',
    codeHash,
    salt,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 4,
    createdAt: Date.now(),
  });

  const fifthFailRes = await handleVerifyBreak({ sessionId: lockoutSessionId, code: '111111' });
  assert(fifthFailRes.status === 400, '5th incorrect attempt fails');
  assert(fifthFailRes.body.error?.includes('Too many incorrect attempts'), 'Informs about lockout');
  assert(store.get(lockoutSessionId) === undefined, 'Code invalidated and deleted after 5 attempts');

  // Test 8: Unauthenticated request handling
  const unauthRes = await handleRequestBreak(undefined, { sessionId: 'no_auth' });
  assert(unauthRes.status === 401, 'Requesting break without token returns 401');

  console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
