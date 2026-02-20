/**
 * Disposable/throwaway email domain blocklist.
 * Used to prevent abuse of free report tier via throwaway email addresses.
 * Block list is intentionally conservative — only well-known disposable providers.
 */

const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  'mailinator.com', 'www.mailinator.com', 'tradermail.info', 'mailinater.com',
  // Guerrilla Mail family
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.info', 'grr.la', 'sharklasers.com',
  'guerrillamailblock.com', 'spam4.me',
  // 10 Minute Mail
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de',
  '10minemail.com',
  // Temp Mail / throwaway
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net',
  'temporaryemail.net', 'throwaway.email', 'throwam.com',
  // Yopmail
  'yopmail.com', 'yopmail.fr', 'yopmail.pp.ua',
  // Trashmail
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmail.io',
  'trashmail.at', 'trash-mail.at', 'trash-mail.io', 'trashemail.at', 'trashimail.com',
  // Maildrop
  'maildrop.cc', 'mailsac.com', 'mailnull.com',
  // Fakeinbox / spam tools
  'fakeinbox.com', 'fakeinbox.net', 'spam.la', 'spam.lol', 'spamgap.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'spamspot.com',
  'spamless.email', 'spamthisplease.com', 'spamtrail.com',
  // Discard / dispostable
  'discard.email', 'dispostable.com',
  // Crap / junk
  'crap.email', 'getairmail.com',
  // Incognito mail
  'incognitomail.com', 'incognitomail.net', 'incognitomail.org',
  // Misc well-known disposable services
  'mailexpire.com', 'meltmail.com', 'mintemail.com', 'mytrashmail.com',
  'nospam.ze.tc', 'owlpic.com', 'rcpt.at', 'safe-mail.net',
  'sharedmailbox.org', 'sogetthis.com', 'supergreatmail.com',
  'tmail.com', 'tmpmail.net', 'weg-werf-email.de', 'zehnminutenmail.de',
  'zippymail.info', 'mailtome.de', 'mailzilla.org',
  // CF/ML/TK/GA domain spam farms
  'trash-mail.cf', 'trash-mail.ga', 'trash-mail.gq', 'trash-mail.ml', 'trash-mail.tk',
  'wmail.cf', 'ttttt.ml',
])

/**
 * Returns true if the email domain is a known disposable/throwaway provider.
 * Only call this on already-validated email addresses.
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}
