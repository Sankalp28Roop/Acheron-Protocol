/**
 * Content Sanitizer
 *
 * Provides server-side HTML sanitisation using isomorphic-dompurify.
 * All inbound email HTML bodies are scrubbed before storage or broadcast.
 * This prevents XSS vectors from reaching the frontend message inbox.
 */

import DOMPurify from 'isomorphic-dompurify';

// ─── HTML Sanitisation ────────────────────────────────────────────────────────

/**
 * Allowed tags and attributes for sanitised email HTML.
 * Restricts to safe presentational elements only.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'span', 'div',
];

const ALLOWED_ATTR = ['href', 'title', 'target'];

/**
 * Sanitises an HTML string, stripping scripts, event handlers, and
 * all elements/attributes not in the allowed list.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force all links to open in a new tab
    FORCE_BODY: true,
    ADD_ATTR: ['target'],
  });
}

/**
 * Strips all HTML and returns plain text.
 * Used for SMS message content and log-safe versions of emails.
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Email Token Extraction ───────────────────────────────────────────────────

/**
 * Extracts the local-part (token) from an email address.
 * e.g. "abc123@cloak.mail" → "abc123"
 * Returns null if the address is malformed.
 */
export function extractEmailToken(address: string): string | null {
  const match = address.match(/^([a-zA-Z0-9_-]+)@/);
  return match?.[1] ?? null;
}

// ─── Credential Value Generation ─────────────────────────────────────────────

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a cryptographically random alphanumeric token of a given length.
 */
export function generateToken(length = 10): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => CHARS[byte % CHARS.length])
    .join('');
}

/**
 * Generates a full disposable email address.
 */
export function generateEmailAddress(): string {
  const domain = process.env.EMAIL_DOMAIN ?? 'cloak.co.in';
  return `${generateToken(10)}@${domain}`;
}
