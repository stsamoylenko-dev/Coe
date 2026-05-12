interface LoadingRuneProps {
  size?: number
  label?: string
}

export default function LoadingRune({ size = 48, label = 'Загрузка...' }: LoadingRuneProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={{ animation: 'runeSpin 2s linear infinite' }}
      >
        <circle cx="24" cy="24" r="20" stroke="var(--color-emerald-dim)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="20" stroke="var(--color-emerald)" strokeWidth="1.5"
          strokeDasharray="30 96" strokeLinecap="round" />
        {/* Inner rune lines */}
        <line x1="24" y1="10" x2="24" y2="38" stroke="var(--color-emerald-dim)" strokeWidth="0.5" />
        <line x1="10" y1="24" x2="38" y2="24" stroke="var(--color-emerald-dim)" strokeWidth="0.5" />
        <polygon
          points="24,4 27,10 21,10"
          fill="var(--color-emerald)"
          opacity="0.8"
        />
        <circle cx="24" cy="24" r="3" fill="var(--color-emerald)" opacity="0.6" />
      </svg>
      {label && (
        <span className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          {label}
        </span>
      )}
    </div>
  )
}
