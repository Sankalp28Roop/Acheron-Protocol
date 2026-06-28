import twilio from 'twilio';

// ─── Client Singleton ─────────────────────────────────────────────────────────

let _client: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio {
  if (_client) return _client;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  }

  _client = twilio(accountSid, authToken);
  return _client;
}

// ─── Number Leasing ───────────────────────────────────────────────────────────

export interface LeasedNumber {
  phoneNumber: string;
  sid: string;
}

/**
 * Searches for an available local phone number and leases (purchases) it.
 * The number is configured with the inbound SMS webhook URL.
 */
export async function leasePhoneNumber(webhookBaseUrl: string, region: 'IN' | 'UK' | 'US' = 'IN'): Promise<LeasedNumber> {
  const client = getTwilioClient();
  const country = region === 'UK' ? 'GB' : region;

  // Search for an available number
  const available = await client.availablePhoneNumbers(country).local.list({
    smsEnabled: true,
    limit: 1,
  });

  if (!available.length) {
    throw new Error(`No available phone numbers found for country: ${country}`);
  }

  const [candidate] = available;

  // Purchase the number and configure it with our inbound SMS webhook
  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber,
    smsUrl: `${webhookBaseUrl}/api/v1/webhooks/sms/twilio`,
    smsMethod: 'POST',
  });

  return {
    phoneNumber: purchased.phoneNumber,
    sid: purchased.sid,
  };
}

/**
 * Releases (deletes) a leased Twilio phone number back to the carrier pool.
 * Called automatically when a credential's TTL expires.
 */
export async function releasePhoneNumber(sid: string): Promise<void> {
  const client = getTwilioClient();
  await client.incomingPhoneNumbers(sid).remove();
}

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Validates an inbound Twilio webhook request signature.
 * Returns false for any signature mismatch (spoofed request).
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  return twilio.validateRequest(authToken, signature, url, params);
}

// ─── Mock Mode (no credentials set) ──────────────────────────────────────────

/**
 * Generates a fake phone number for development/simulation when
 * Twilio credentials are not configured.
 */
export function generateMockPhoneNumber(region: 'IN' | 'UK' | 'US' = 'IN'): LeasedNumber {
  const prefix = region === 'IN' ? '+91' : region === 'UK' ? '+44' : '+1';
  const randomTenDigit = Math.floor(6000000000 + Math.random() * 3999999999);
  const number = `${prefix}${randomTenDigit}`;
  return { phoneNumber: number, sid: `MOCK_${number.replace('+', '')}` };
}

export function isTwilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}
