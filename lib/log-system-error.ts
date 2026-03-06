/**
 * logSystemError — fire-and-forget server-side error logger.
 *
 * Writes to the system_errors table so admins can see backend failures
 * in the Error Monitor (System Errors tab) without reading server logs.
 *
 * Usage:
 *   logSystemError('api', 'Stripe webhook signature failed', { rawBody }, '/api/webhook/stripe')
 *
 * Call this in catch blocks for unexpected errors in critical API routes.
 * Never awaited — never throws — safe to call without affecting request flow.
 */

import { createServiceClient } from '@/lib/supabase/service-client'

type ErrorType = 'auth' | 'payment' | 'webhook' | 'api' | 'email'

export function logSystemError(
  type: ErrorType,
  message: string,
  context?: Record<string, unknown>,
  route?: string
): void {
  // Fire and forget — errors in the logger must never crash the caller
  void (async () => {
    try {
      const svc = createServiceClient()
      await svc.from('system_errors').insert({
        type,
        message: String(message).slice(0, 2000),
        context: context ?? null,
        route: route ?? null,
      })
    } catch {
      // Swallow — logging failures should never be surfaced to users
    }
  })()
}
