'use client'

interface Props {
  password: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 12) score += 2
  else if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-400' }
  return { score, label: 'Strong', color: 'bg-green-500' }
}

export default function PasswordStrengthMeter({ password }: Props) {
  const { score, label, color } = getStrength(password)
  if (!password) return null
  const pct = Math.min(100, Math.round((score / 6) * 100))

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs ${score <= 2 ? 'text-red-400' : score <= 4 ? 'text-amber-400' : 'text-green-400'}`}>
        {label}
      </p>
    </div>
  )
}
