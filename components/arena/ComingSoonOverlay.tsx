export default function ComingSoonOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="font-mono text-[10px] tracking-[0.5em] text-[var(--color-text-muted)] uppercase">
          Секция временно недоступна
        </div>
        <div
          className="font-display text-4xl sm:text-5xl font-bold"
          style={{
            color:      '#c0a040',
            textShadow: '0 0 20px rgba(192,160,64,0.5), 0 0 40px rgba(192,160,64,0.2)',
          }}
        >
          СКОРО ОТКРЫТИЕ
        </div>
        <div className="font-mono text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
          Арена откроется когда достигнет критической массы воинов.
          Ваша мана уже копится.
        </div>
      </div>
    </div>
  )
}
