export function AutomationIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" className="text-primary" opacity="0.2"/>
      <circle cx="30" cy="30" r="8" fill="currentColor" className="text-primary"/>
      <circle cx="70" cy="30" r="8" fill="currentColor" className="text-accent-blue"/>
      <circle cx="50" cy="70" r="8" fill="currentColor" className="text-accent-purple"/>
      <line x1="35" y1="32" x2="45" y2="65" stroke="currentColor" strokeWidth="2" className="text-primary"/>
      <line x1="65" y1="32" x2="55" y2="65" stroke="currentColor" strokeWidth="2" className="text-accent-blue"/>
      <line x1="35" y1="28" x2="65" y2="28" stroke="currentColor" strokeWidth="2" className="text-primary" strokeDasharray="4 4"/>
    </svg>
  );
}

export function AIIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="2" className="text-primary"/>
      <circle cx="40" cy="45" r="3" fill="currentColor" className="text-primary"/>
      <circle cx="60" cy="45" r="3" fill="currentColor" className="text-primary"/>
      <path d="M 40 60 Q 50 68 60 60" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none"/>
      <path d="M 20 50 L 25 50" stroke="currentColor" strokeWidth="2" className="text-accent-blue"/>
      <path d="M 75 50 L 80 50" stroke="currentColor" strokeWidth="2" className="text-accent-blue"/>
      <path d="M 50 20 L 50 25" stroke="currentColor" strokeWidth="2" className="text-accent-purple"/>
      <path d="M 50 75 L 50 80" stroke="currentColor" strokeWidth="2" className="text-accent-purple"/>
    </svg>
  );
}

export function AnalyticsIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="60" width="15" height="25" rx="2" fill="currentColor" className="text-primary" opacity="0.6"/>
      <rect x="42.5" y="40" width="15" height="45" rx="2" fill="currentColor" className="text-primary" opacity="0.8"/>
      <rect x="65" y="20" width="15" height="65" rx="2" fill="currentColor" className="text-primary"/>
      <path d="M 27.5 55 L 50 35 L 72.5 15" stroke="currentColor" strokeWidth="2" className="text-accent-blue" strokeLinecap="round"/>
    </svg>
  );
}

export function OptimizeIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" className="text-primary" strokeDasharray="5 5"/>
      <path d="M 50 15 L 50 30" stroke="currentColor" strokeWidth="3" className="text-accent-blue" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="15" fill="currentColor" className="text-primary" opacity="0.3"/>
      <path d="M 45 50 L 50 55 L 60 40" stroke="currentColor" strokeWidth="3" className="text-white" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function CheckCircle({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-primary"/>
      <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="2" className="text-primary" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
