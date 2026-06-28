/**
 * OTP Extraction Utility
 *
 * Extracts One-Time Passwords (OTPs) from raw SMS message strings using
 * a robust regex matching strategy (targets 4 to 6 digit standalone codes).
 */

export function extractOTP(messageText: string): string | undefined {
  const otpRegex = /\b\d{4,6}\b/;
  const match = messageText.match(otpRegex);
  return match ? match[0] : undefined;
}
