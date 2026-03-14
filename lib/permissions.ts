/**
 * Role-based access control helper.
 * Single source of truth for what each role can do.
 *
 * Roles (lowest → highest):
 *   user → client → affiliate → tester → support → admin → superadmin
 *
 * user:        Regular customer
 * client:      Future high-end client (custom billing/project dashboard — not built yet)
 * affiliate:   Partner with referral link; earns revenue share on conversions (dashboard not built yet)
 * tester:      Internal QA — infinite credits, bug report button, no admin access
 * support:     Support staff — limited admin panel (tickets, disputes, bug reports)
 * admin:       Full admin except Stripe, account deletion, role promotion, and system settings
 * superadmin:  Full access — Stripe, delete accounts, promote roles, system settings
 */

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'support'
  | 'tester'
  | 'affiliate'
  | 'client'
  | 'user'

export type Action =
  // Ticket / support operations (support role and above)
  | 'view_admin_panel'
  | 'view_all_tickets'
  | 'reply_ticket'
  | 'assign_ticket'
  | 'close_ticket'
  | 'resolve_ticket'
  | 'view_bug_reports'
  | 'change_ticket_category'

  // Admin operations (admin role and above)
  | 'grant_credits'
  | 'view_users'
  | 'approve_testimonials'
  | 'view_error_monitoring'
  | 'view_any_report'
  | 'view_any_notification'
  | 'manage_account'   // update email/phone, suspend/unsuspend

  // Role management — admin can set roles BELOW admin only (enforced in server action)
  | 'manage_roles'

  // Superadmin-only
  | 'system_settings'
  | 'process_refunds'  // actual Stripe API calls
  | 'delete_account'

const ADMIN_ROLES: string[] = ['superadmin', 'admin']
const SUPPORT_ROLES: string[] = ['superadmin', 'admin', 'support']

const PERMISSIONS: Record<Action, string[]> = {
  // Ticket operations — support and above
  view_admin_panel:      SUPPORT_ROLES,
  view_all_tickets:      SUPPORT_ROLES,
  reply_ticket:          SUPPORT_ROLES,
  assign_ticket:         SUPPORT_ROLES,
  close_ticket:          SUPPORT_ROLES,
  resolve_ticket:        SUPPORT_ROLES,
  view_bug_reports:          SUPPORT_ROLES,
  change_ticket_category:    SUPPORT_ROLES,

  // Admin-only operations
  grant_credits:         ADMIN_ROLES,
  view_users:            ADMIN_ROLES,
  approve_testimonials:  ADMIN_ROLES,
  view_error_monitoring: ADMIN_ROLES,
  view_any_report:       ADMIN_ROLES,
  view_any_notification: ADMIN_ROLES,
  manage_account:        ADMIN_ROLES,
  manage_roles:          ADMIN_ROLES, // scope enforced in server action (admin can't promote to admin+)

  // Superadmin-only
  system_settings: ['superadmin'],
  process_refunds: ['superadmin'],
  delete_account:  ['superadmin'],
}

export function canDo(role: string | undefined | null, action: Action): boolean {
  if (!role) return false
  return PERMISSIONS[action].includes(role)
}

/** Roles that appear in the admin panel nav. */
export const ADMIN_NAV_ROLES = SUPPORT_ROLES

/** Roles to bell-notify when a new support ticket arrives. */
export const TICKET_NOTIFY_ROLES = SUPPORT_ROLES

/** Roles to bell-notify for system events (bug reports, testimonials, etc.). */
export const SYSTEM_NOTIFY_ROLES = ADMIN_ROLES

/**
 * Returns the highest role a given caller is allowed to assign.
 * superadmin: any role
 * admin: up to 'support' (cannot promote to admin or superadmin)
 * others: cannot assign roles
 */
export function assignableRoles(callerRole: string | undefined | null): UserRole[] {
  if (callerRole === 'superadmin') {
    return ['user', 'client', 'affiliate', 'tester', 'support', 'admin', 'superadmin']
  }
  if (callerRole === 'admin') {
    return ['user', 'client', 'affiliate', 'tester', 'support']
  }
  return []
}
