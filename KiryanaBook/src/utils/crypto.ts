/**
 * Secure Hashing Utility
 * Uses Web Crypto API for high-performance, dependency-free SHA-256 hashing.
 */

export async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates a plaintext PIN against a stored hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!pin || !hash) return false;
  const hashedInput = await hashPin(pin);
  return hashedInput === hash;
}

/**
 * Basic Sanitization to prevent XSS and DB formatting issues
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}
