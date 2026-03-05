import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.ADMIN_FAILURE_HMAC_SECRET!
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function signFailureToken(reportId: string, status: string, ts: number): string {
  const message = `${reportId}:${status}:${ts}`
  return createHmac('sha256', SECRET).update(message).digest('hex')
}

export function verifyFailureToken(
  reportId: string,
  status: string,
  ts: number,
  sig: string
): boolean {
  if (Date.now() - ts > TOKEN_TTL_MS) return false
  const expected = signFailureToken(reportId, status, ts)
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
