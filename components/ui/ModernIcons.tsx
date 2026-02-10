export function WorkflowIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00adb5" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="12" fill="url(#grad1)" opacity="0.8"/>
      <circle cx="90" cy="30" r="12" fill="url(#grad1)" opacity="0.8"/>
      <circle cx="60" cy="60" r="12" fill="url(#grad1)"/>
      <circle cx="30" cy="90" r="12" fill="url(#grad1)" opacity="0.8"/>
      <circle cx="90" cy="90" r="12" fill="url(#grad1)" opacity="0.8"/>
      <path d="M35 32 L55 58" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M85 32 L65 58" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M58 65 L32 88" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M62 65 L88 88" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function BotIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00adb5" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="30" y="40" width="60" height="50" rx="12" stroke="url(#grad2)" strokeWidth="4" fill="none"/>
      <circle cx="48" cy="60" r="5" fill="url(#grad2)"/>
      <circle cx="72" cy="60" r="5" fill="url(#grad2)"/>
      <path d="M48 75 Q60 82 72 75" stroke="url(#grad2)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <rect x="52" y="25" width="16" height="15" rx="4" fill="url(#grad2)" opacity="0.6"/>
      <circle cx="60" cy="18" r="4" fill="url(#grad2)"/>
      <path d="M30 50 L20 50 L20 70" stroke="url(#grad2)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M90 50 L100 50 L100 70" stroke="url(#grad2)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function ChartIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="25" y="70" width="18" height="30" rx="4" fill="url(#grad3)" opacity="0.6"/>
      <rect x="51" y="50" width="18" height="50" rx="4" fill="url(#grad3)" opacity="0.8"/>
      <rect x="77" y="30" width="18" height="70" rx="4" fill="url(#grad3)"/>
      <path d="M34 65 L60 45 L86 25" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="34" cy="65" r="4" fill="#00e5ff"/>
      <circle cx="60" cy="45" r="4" fill="#00e5ff"/>
      <circle cx="86" cy="25" r="4" fill="#00e5ff"/>
    </svg>
  );
}

export function GearIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#00adb5" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="20" stroke="url(#grad4)" strokeWidth="4" fill="none"/>
      <circle cx="60" cy="60" r="10" fill="url(#grad4)" opacity="0.8"/>
      <rect x="56" y="25" width="8" height="15" rx="2" fill="url(#grad4)"/>
      <rect x="56" y="80" width="8" height="15" rx="2" fill="url(#grad4)"/>
      <rect x="25" y="56" width="15" height="8" rx="2" fill="url(#grad4)"/>
      <rect x="80" y="56" width="15" height="8" rx="2" fill="url(#grad4)"/>
      <rect x="35" y="35" width="12" height="12" rx="2" fill="url(#grad4)" opacity="0.6" transform="rotate(-45 41 41)"/>
      <rect x="73" y="73" width="12" height="12" rx="2" fill="url(#grad4)" opacity="0.6" transform="rotate(-45 79 79)"/>
      <rect x="73" y="35" width="12" height="12" rx="2" fill="url(#grad4)" opacity="0.6" transform="rotate(45 79 41)"/>
      <rect x="35" y="73" width="12" height="12" rx="2" fill="url(#grad4)" opacity="0.6" transform="rotate(45 41 79)"/>
    </svg>
  );
}
