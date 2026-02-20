/**
 * Phone validation utilities.
 *
 * Validates phone format for user-submitted numbers.
 * Rejects obviously fake numbers (all same digits, sequential runs, common test sequences).
 * Phone is optional in all forms — only call these when phone is non-empty.
 */

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '')
}

// E.164 digit sequences used to detect sequential fakes
const ASCENDING  = '01234567890123456789'
const DESCENDING = '98765432109876543210'

/**
 * Returns true if the phone number passes basic format validation.
 * - Must be 7–15 digits after stripping non-digits (E.164 range; 7 allows small nations)
 * - Must not be all the same digit (e.g., 5555555555, 0000000000)
 * - Must not have 7+ trailing identical digits (e.g., 5550000000, 8001111111)
 * - Must not contain a sequential run of 7+ consecutive digits (e.g., 1234567, 9876543)
 * - Must not match common test/placeholder sequences
 */
export function isValidPhone(phone: string): boolean {
  const digits = digitsOnly(phone)
  if (digits.length < 7 || digits.length > 15) return false

  // All same digit
  if (/^(\d)\1+$/.test(digits)) return false

  // 7+ trailing identical digits (e.g., 5550000000)
  if (/(\d)\1{6,}/.test(digits)) return false

  // Sequential run of 7+ digits anywhere in the number
  for (let i = 0; i <= digits.length - 7; i++) {
    const chunk = digits.slice(i, i + 7)
    if (ASCENDING.includes(chunk) || DESCENDING.includes(chunk)) return false
  }

  // Explicit common test sequences (with or without leading country code)
  const noLeadingOne = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits
  const fakeExact = new Set([
    '1234567890', '0987654321', '1234567891', '0000000000',
    '1111111111', '2222222222', '9999999999',
  ])
  if (fakeExact.has(digits) || fakeExact.has(noLeadingOne)) return false

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
