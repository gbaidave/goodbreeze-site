/**
 * Role-based access control helper.
 * Single source of truth for what each role can do.
 *
 * Roles (lowest → highest):
 *   user → tester → client → support → admin → superadmin
 *
 * "support" replaces the old "superuser" name.
 * Build the full hierarchy (migration 035) when first non-Dave admin is onboarded.
 */

export type UserRole = 'superadmin' | 'admin' | 'support' | 'tester' | 'client' | 'user'

export type Action =
  | 'view_admin_panel'
  | 'view_all_tickets'
  | 'reply_ticket'
  | 'assign_ticket'
  | 'close_ticket'
  | 'resolve_ticket'
  | 'grant_credits'
  | 'view_users'
  | 'approve_testimonials'
  | 'view_error_monitoring'
  | 'manage_roles'
  | 'system_settings'
  | 'view_any_report'
  | 'view_any_notification'

const ADMIN_ROLES: string[] = ['superadmin', 'admin']
const SUPPORT_ROLES: string[] = ['superadmin', 'admin', 'support']

const PERMISSIONS: Record<Action, string[]> = {
  // Ticket operations — support role included
  view_admin_panel:      SUPPORT_ROLES,
  view_all_tickets:      SUPPORT_ROLES,
  reply_ticket:          SUPPORT_ROLES,
  assign_ticket:         SUPPORT_ROLES, // support can self-assign only (enforced in route)
  close_ticket:          SUPPORT_ROLES,
  resolve_ticket:        SUPPORT_ROLES,

  // Admin-only operations
  grant_credits:         ADMIN_ROLES,
  view_users:            ADMIN_ROLES,
  approve_testimonials:  ADMIN_ROLES,
  view_error_monitoring: ADMIN_ROLES,
  view_any_report:       ADMIN_ROLES,
  view_any_notification: ADMIN_ROLES,

  // Superadmin-only
  manage_roles:    ['superadmin'],
  system_settings: ['superadmin'],
}

export function canDo(role: string | undefined | null, action: Action): boolean {
  if (!role) return false
  return PERMISSIONS[action].includes(role)
}

/** Roles to bell-notify when a new support ticket arrives. */
export const TICKET_NOTIFY_ROLES = SUPPORT_ROLES

/** Roles to bell-notify for system events (bug reports, testimonials, etc.). */
export const SYSTEM_NOTIFY_ROLES = ADMIN_ROLES
