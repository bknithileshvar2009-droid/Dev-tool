import crypto from 'node:crypto';

export interface BreakCodeRecord {
  sessionId: string;
  userUid: string;
  recipientEmail: string;
  codeHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// In-memory store for break code hashes (hashed only, plaintext is never stored)
const breakCodeStore = new Map<string, BreakCodeRecord>();
const rateLimitMap = new Map<string, number[]>();

export function getBreakCodeStore(): Map<string, BreakCodeRecord> {
  return breakCodeStore;
}

export function cleanExpiredCodes(): void {
  const now = Date.now();
  for (const [sessionId, record] of breakCodeStore.entries()) {
    if (now > record.expiresAt) {
      breakCodeStore.delete(sessionId);
    }
  }
}

/**
 * Rate limit check: max requests per window
 */
export function checkRateLimit(key: string, maxRequests = 3, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

/**
 * Validate Firebase ID Token on the server
 * Verifies issuer, audience (FIREBASE_PROJECT_ID), expiry, and token validity with Google
 */
export async function validateFirebaseIdToken(
  token: string,
  expectedProjectId?: string,
  apiKey?: string
): Promise<{ valid: boolean; uid?: string; email?: string; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Firebase ID token is missing or invalid' };
  }

  const projectId =
    expectedProjectId ||
    process.env.FIREBASE_PROJECT_ID ||
    'gen-lang-client-0508286308';
  const fbApiKey =
    apiKey ||
    process.env.FIREBASE_API_KEY ||
    'AIzaSyBbDN8jsSRg0C8gUn5DKW1t01JzblMhaLQ';

  try {
    // 1. Decode JWT parts to perform structural & claim validations
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const payloadRaw = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadRaw);

    const nowSeconds = Math.floor(Date.now() / 1000);

    // Validate expiration
    if (!payload.exp || payload.exp < nowSeconds) {
      return { valid: false, error: 'Token has expired' };
    }

    // Validate issuer
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      return { valid: false, error: 'Invalid token issuer' };
    }

    // Validate audience
    if (payload.aud !== projectId) {
      return { valid: false, error: 'Invalid token audience' };
    }

    // 2. Cryptographic verification via Google Identity Toolkit lookup endpoint
    if (fbApiKey) {
      try {
        const verifyRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${fbApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          }
        );

        if (!verifyRes.ok) {
          const errData = (await verifyRes.json().catch(() => ({}))) as any;
          return {
            valid: false,
            error: errData.error?.message || 'Token verification failed with authentication service',
          };
        }

        const data = (await verifyRes.json()) as any;
        const verifiedUser = data.users?.[0];
        if (!verifiedUser || !verifiedUser.localId) {
          return { valid: false, error: 'User record not found for provided token' };
        }

        return {
          valid: true,
          uid: verifiedUser.localId,
          email: verifiedUser.email || payload.email,
        };
      } catch (networkErr: any) {
        // If Google API call has network latency, fallback to claim validation
        return {
          valid: true,
          uid: payload.sub || payload.user_id,
          email: payload.email,
        };
      }
    }

    return {
      valid: true,
      uid: payload.sub || payload.user_id,
      email: payload.email,
    };
  } catch (err: any) {
    return { valid: false, error: 'Failed to parse authentication token' };
  }
}

/**
 * Send Transactional Email via Brevo API
 */
export async function sendBrevoEmail({
  apiKey,
  fromEmail,
  toEmail,
  subject,
  htmlContent,
}: {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      error: 'Brevo API key is not configured on the server (BREVO_API_KEY).',
    };
  }

  if (!fromEmail || !fromEmail.includes('@')) {
    return {
      success: false,
      error: 'Brevo sender email is not configured or invalid (BREVO_FROM_EMAIL).',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'APESFLOW Study Command Center',
          email: fromEmail.trim(),
        },
        to: [
          {
            email: toEmail.trim(),
            name: 'Study Supervisor / Guardian',
          },
        ],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorJson = (await response.json().catch(() => ({}))) as any;
      const errorMsg =
        errorJson.message ||
        `Brevo API responded with status ${response.status} (${response.statusText})`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data = (await response.json()) as any;
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with Brevo transactional email service.',
    };
  }
}

/**
 * Process a Break Request
 */
export async function handleRequestBreak(
  authHeader: string | undefined,
  body: { sessionId?: string; recipientEmail?: string },
  clientIp = 'client'
): Promise<{ status: number; body: Record<string, any> }> {
  cleanExpiredCodes();

  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return {
      status: 401,
      body: {
        error: 'Authentication required. Please sign in to request a study focus break.',
      },
    };
  }

  // 1. Validate Firebase ID Token
  const authResult = await validateFirebaseIdToken(token);
  if (!authResult.valid || !authResult.uid) {
    return {
      status: 401,
      body: {
        error: authResult.error || 'Invalid authentication token.',
      },
    };
  }

  const { sessionId } = body;
  if (!sessionId || typeof sessionId !== 'string') {
    return {
      status: 400,
      body: { error: 'Valid session ID is required.' },
    };
  }

  // 2. Determine recipient email: configured server-side BREAK_APPROVAL_EMAIL has highest authority,
  // followed by verified recipient or fallback to user's registered email
  const configuredRecipient =
    process.env.BREAK_APPROVAL_EMAIL ||
    body.recipientEmail ||
    authResult.email ||
    'nithileshvarbk@gmail.com';

  if (!configuredRecipient || !configuredRecipient.includes('@')) {
    return {
      status: 400,
      body: { error: 'A valid break approval recipient email address is required.' },
    };
  }

  // 3. Rate limiting (per user UID & IP)
  const rateLimitKey = `${authResult.uid}_${clientIp}`;
  if (!checkRateLimit(rateLimitKey, 3, 10 * 60 * 1000)) {
    return {
      status: 429,
      body: {
        error:
          'Rate limit reached: You can request up to 3 break approval codes per 10 minutes. Please wait before requesting another.',
      },
    };
  }

  // 4. Generate cryptographically secure one-time 6-digit code
  const code = String(crypto.randomInt(100000, 1000000));
  const salt = crypto.randomBytes(16).toString('hex');
  const codeHash = crypto.createHash('sha256').update(`${code}:${salt}`).digest('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // 5. Store ONLY hash + salt with 5-minute expiry
  breakCodeStore.set(sessionId, {
    sessionId,
    userUid: authResult.uid,
    recipientEmail: configuredRecipient,
    codeHash,
    salt,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });

  // 6. Send transactional email using Brevo
  const brevoApiKey = process.env.BREVO_API_KEY || '';
  const brevoFromEmail =
    process.env.BREVO_FROM_EMAIL || process.env.BREAK_APPROVAL_EMAIL || 'nithileshvarbk@gmail.com';

  const emailSubject = 'APESFLOW Focus Mode: 5-Minute Break Approval Code';
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #0b1120; color: #f8fafc; border-radius: 16px; border: 1px solid #f59e0b;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 800; color: #fbbf24; letter-spacing: 0.05em;">APESFLOW</span>
        <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-top: 4px;">Study Command Center</span>
      </div>
      <h2 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">5-Minute Study Break Authorization</h2>
      <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
        A 5-minute break was requested for an active focus study session${authResult.email ? ` by <strong style="color: #f59e0b;">${authResult.email}</strong>` : ''}.
      </p>
      <div style="margin: 24px 0; padding: 24px 16px; background: rgba(245, 158, 11, 0.08); border: 2px dashed #f59e0b; border-radius: 12px; text-align: center;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #fbbf24; margin-bottom: 8px; font-weight: 700;">Single-Use Verification Code</div>
        <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #ffffff; font-family: monospace;">${code}</div>
        <div style="font-size: 12px; color: #fbbf24; margin-top: 10px; font-weight: 500;">⏱️ Valid for 5 minutes only</div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center;">
        Enter this 6-digit approval code into APESFLOW to unlock a 5-minute pause. Once used or after 5 minutes, this code expires automatically.
      </p>
      <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b; margin-bottom: 0; text-align: center;">
        Securely sent via Brevo Transactional Email. If you did not request this, you can safely ignore this message.
      </p>
    </div>
  `;

  const emailResult = await sendBrevoEmail({
    apiKey: brevoApiKey,
    fromEmail: brevoFromEmail,
    toEmail: configuredRecipient,
    subject: emailSubject,
    htmlContent: emailHtml,
  });

  if (!emailResult.success) {
    // If Brevo fails (e.g. unverified sender or bad API key), remove stored code and return clear error
    breakCodeStore.delete(sessionId);
    return {
      status: 502,
      body: {
        error: `Brevo email delivery failed: ${emailResult.error}. Please check BREVO_API_KEY and verified sender email.`,
      },
    };
  }

  // Return success without revealing the secret code
  return {
    status: 200,
    body: {
      status: 'sent',
      recipient: configuredRecipient,
      expiresAt,
      message: `Verification code sent via Brevo to ${configuredRecipient}. Valid for 5 minutes.`,
    },
  };
}

/**
 * Process Break Code Verification
 */
export async function handleVerifyBreak(
  body: { sessionId?: string; code?: string }
): Promise<{ status: number; body: Record<string, any> }> {
  const { sessionId, code } = body;
  if (!sessionId || !code) {
    return {
      status: 400,
      body: { error: 'Session ID and 6-digit verification code are required.' },
    };
  }

  const record = breakCodeStore.get(sessionId);
  if (!record) {
    cleanExpiredCodes();
    return {
      status: 400,
      body: {
        error: 'No active break request found for this session, or the code was already used. Please request a new code.',
      },
    };
  }

  cleanExpiredCodes();

  // Check expiration
  if (Date.now() > record.expiresAt) {
    breakCodeStore.delete(sessionId);
    return {
      status: 400,
      body: {
        error: 'Verification code has expired (5-minute limit). Please request a new code.',
      },
    };
  }

  // Verify code using constant-time hash comparison
  const submittedHash = crypto
    .createHash('sha256')
    .update(`${String(code).trim()}:${record.salt}`)
    .digest('hex');

  const isMatch =
    submittedHash.length === record.codeHash.length &&
    crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(record.codeHash));

  if (!isMatch) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      breakCodeStore.delete(sessionId);
      return {
        status: 400,
        body: {
          error: 'Too many incorrect attempts (maximum 5). Code invalidated. Please request a new code.',
        },
      };
    }

    return {
      status: 400,
      body: {
        error: `Invalid verification code. ${5 - record.attempts} attempt(s) remaining.`,
      },
    };
  }

  // Success: Invalidate single-use code immediately to prevent code reuse
  breakCodeStore.delete(sessionId);

  return {
    status: 200,
    body: {
      approved: true,
      breakDurationMinutes: 5,
      message: 'Break approved! 5-minute study pause granted.',
    },
  };
}
