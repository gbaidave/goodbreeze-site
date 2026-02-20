/**
 * Phone validation utilities.
 *
 * Validates phone format for user-submitted numbers.
 * Rejects obviously fake numbers (all same digits, common test sequences).
 * Phone is optional in all forms — only call these when phone is non-empty.
 */

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Returns true if the phone number passes basic format validation.
 * - Must be 10–15 digits after stripping non-digits (E.164 range)
 * - Must not be all the same digit (e.g., 5555555555, 0000000000)
 * - Must not match common test sequences (1234567890, etc.)
 */
export function isValidPhone(phone: string): boolean {
  const digits = digitsOnly(phone)
  if (digits.length < 10 || digits.length > 15) return false
  if (/^(\d)\1+$/.test(digits)) return false
  if (digits === '1234567890' || digits === '0987654321') return false
  return true
}

/**
 * Normalizes a phone number for storage.
 * Strips whitespace, dashes, and parens. Preserves + prefix for E.164 format.
 */
export function normalizePhone(phone: string): string {
  const hasPlus = phone.trim().startsWith('+')
  const digits = digitsOnly(phone)
  return hasPlus ? `+${digits}` : digits
}
