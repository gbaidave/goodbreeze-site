'use client'

interface Props {
  returnUrl: string
}

/**
 * Shown as a modal overlay when a logged-out user tries to access a report page.
 * Matches the style of PhoneGatePrompt.
 */
export function LoginGatePrompt({ returnUrl }: Props) {
  const encoded = encodeURIComponent(returnUrl)

  return (
    <div className="p-6 bg-zinc-900 border border-cyan-500/30 rounded-xl space-y-4">
      <div>
        <p className="text-cyan-300 font-semibold text-sm">Sign in to view this report</p>
        <p className="text-gray-400 text-sm mt-1">
          You need a Good Breeze AI account to run and view reports.
        </p>
      </div>
      <div className="flex gap-2">
        <a
          href={`/login?returnUrl=${encoded}`}
          className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          Sign in
        </a>
        <a
          href={`/signup?returnUrl=${encoded}`}
          className="flex-1 text-center px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
        >
          Create account
        </a>
      </div>
    </div>
  )
}
