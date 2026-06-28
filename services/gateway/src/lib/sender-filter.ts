/**
 * Sender Filter
 *
 * Silently drops inbound messages from blocked sender domains.
 * The block list is configured via the BLOCKED_SENDER_DOMAINS environment
 * variable (comma-separated domain names).
 *
 * Messages matching blocked senders are dropped BEFORE any WebSocket
 * broadcast or Redis write — they leave no trace in the system.
 *
 * SECURITY NOTE: This is a server-side deny-list under your control.
 * No hardcoded domain list is embedded in this code.
 */

// ─── Block List ───────────────────────────────────────────────────────────────

let _blockedDomains: Set<string> | null = null;

/**
 * Returns the active block list as a Set, lazily initialised from env.
 */
function getBlockedDomains(): Set<string> {
  if (_blockedDomains) return _blockedDomains;

  const raw = process.env.BLOCKED_SENDER_DOMAINS ?? '';
  _blockedDomains = new Set(
    raw
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );

  return _blockedDomains;
}

/**
 * Extracts the domain from an email address or phone number sender.
 * For email: "noreply@chase.com" → "chase.com"
 * For SMS (phone number): no domain, returns null
 */
function extractDomain(sender: string): string | null {
  const atIndex = sender.lastIndexOf('@');
  if (atIndex === -1) return null;
  return sender.slice(atIndex + 1).toLowerCase();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the message should be dropped (sender is blocked).
 * Returns false if the message is allowed to proceed.
 */
export function isSenderBlocked(sender: string): boolean {
  const blocked = getBlockedDomains();
  if (blocked.size === 0) return false;

  const domain = extractDomain(sender);
  if (!domain) return false;

  return blocked.has(domain);
}

/**
 * Forces a reload of the block list from environment variables.
 * Useful for hot-reloading configuration without restart.
 */
export function reloadBlockList(): void {
  _blockedDomains = null;
}
