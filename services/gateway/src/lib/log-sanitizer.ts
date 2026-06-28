/**
 * Log Sanitizer
 *
 * SECURITY: This module ensures that raw SMS message bodies and email
 * content NEVER appear in application logs or reach any log sink (disk,
 * stdout, external log aggregator, etc.).
 *
 * All message body fields are replaced with the sentinel value
 * [CONTENT_REDACTED] before any log statement is emitted.
 */

// ─── Field Names to Redact ────────────────────────────────────────────────────

const REDACTED_FIELDS = new Set([
  'body',
  'Body',
  'text',
  'content',
  'message',
  'html',
  'htmlBody',
  'plainText',
  'smsBody',
  'emailBody',
  'subject',
]);

const REDACTED_SENTINEL = '[CONTENT_REDACTED]';

// ─── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Recursively redacts sensitive fields from a log object.
 * Returns a new object safe for logging.
 */
export function sanitizeForLog<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_FIELDS.has(key)) {
      result[key] = REDACTED_SENTINEL;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Creates a safe log payload for an inbound email webhook.
 * Strips all content fields before returning the log object.
 */
export function safeEmailLog(params: {
  recipient: string;
  sender: string;
  credentialValue: string;
  timestamp?: number;
}): Record<string, unknown> {
  return {
    event: 'inbound_email',
    recipient: params.recipient,
    sender: params.sender,
    credentialValue: params.credentialValue,
    timestamp: params.timestamp ?? Date.now(),
    // body: INTENTIONALLY OMITTED
    // html: INTENTIONALLY OMITTED
  };
}

/**
 * Creates a safe log payload for an inbound SMS webhook.
 * Strips the Body field before returning the log object.
 */
export function safeSmsLog(params: {
  to: string;
  from: string;
  messageSid: string;
  timestamp?: number;
}): Record<string, unknown> {
  return {
    event: 'inbound_sms',
    to: params.to,
    from: params.from,
    messageSid: params.messageSid,
    timestamp: params.timestamp ?? Date.now(),
    // Body: INTENTIONALLY OMITTED
  };
}
