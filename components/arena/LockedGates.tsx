'use client'

import ComingSoonOverlay from './ComingSoonOverlay'
import ManaCounter from './ManaCounter'

interface LockedGatesProps {
  mana:    number
  hasMana: boolean
}

export default function LockedGates({ mana, hasMana }: LockedGatesProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Gate visual */}
      <div
        className="relative rounded-xl border border-[rgba(192,160,64,0.2)] overflow-hidden"
        style={{ minHeight: 480, background: 'radial-gradient(ellipse at center, rgba(30,20,5,0.9) 0%, rgba(4,13,9,0.95) 100%)' }}
      >
        {/* Dark veil */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] z-10" />

        {/* Gate SVG */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-40">
          <svg width="320" height="400" viewBox="0 0 320 400" fill="none">
            {/* Gate arch */}
            <path
              d="M40 400 L40 160 Q40 40 160 40 Q280 40 280 160 L280 400"
              stroke="rgba(192,160,64,0.6)" strokeWidth="2" fill="none"
            />
            {/* Gate panels */}
            <rect x="40" y="200" width="105" height="200" fill="rgba(20,15,5,0.8)" stroke="rgba(192,160,64,0.3)" strokeWidth="1" />
            <rect x="175" y="200" width="105" height="200" fill="rgba(20,15,5,0.8)" stroke="rgba(192,160,64,0.3)" strokeWidth="1" />

            {/* Lock */}
            <rect x="132" y="270" width="56" height="42" rx="4"
              fill="rgba(10,8,2,0.9)" stroke="rgba(192,160,64,0.7)" strokeWidth="1.5" />
            <path d="M148 270 L148 258 Q148 244 160 244 Q172 244 172 258 L172 270"
              stroke="rgba(192,160,64,0.7)" strokeWidth="1.5" fill="none" />
            <circle cx="160" cy="292" r="7" fill="rgba(192,160,64,0.4)" stroke="rgba(192,160,64,0.8)" strokeWidth="1" />
            <line x1="160" y1="292" x2="160" y2="303" stroke="rgba(192,160,64,0.6)" strokeWidth="1.5" />

            {/* Chain decorations */}
            {[260, 280, 300, 320, 340, 360].map((y, i) => (
              <g key={y} style={{ animation: `chainSwing ${1.5 + i * 0.1}s ease-in-out infinite`, transformOrigin: '65px 260px' }}>
                <ellipse cx="65" cy={y} rx="8" ry="5" stroke="rgba(192,160,64,0.4)" strokeWidth="1" fill="none" />
              </g>
            ))}
            {[260, 280, 300, 320, 340, 360].map((y, i) => (
              <g key={y + 1000} style={{ animation: `chainSwing ${1.5 + i * 0.1}s ease-in-out infinite`, transformOrigin: '255px 260px' }}>
                <ellipse cx="255" cy={y} rx="8" ry="5" stroke="rgba(192,160,64,0.4)" strokeWidth="1" fill="none" />
              </g>
            ))}

            {/* Ember particles */}
            {[0, 1, 2, 3, 4].map(i => (
              <circle
                key={i}
                cx={100 + i * 30}
                cy={360 - i * 20}
                r="2"
                fill="rgba(200,100,0,0.6)"
                style={{
                  animation: `particleRise ${2 + i * 0.4}s ease-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Overlay content */}
        <ComingSoonOverlay />

        {/* Bottom: mana display */}
        {hasMana && (
          <div className="absolute bottom-0 left-0 right-0 z-30 p-8 flex justify-center
            bg-gradient-to-t from-[rgba(4,13,9,0.95)] to-transparent">
            <ManaCounter mana={mana} visible />
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon:  '⚔',
            title: 'Механика боя',
            desc:  'Победа определяется комбинацией ДНК (паттерна 4N) и Брони (доп. доменов)',
          },
          {
            icon:  '✦',
            title: 'Магия Маны',
            desc:  'Несколько 4N-доменов концентрируют ману. Чем больше — тем мощнее заклинания',
          },
          {
            icon:  '◎',
            title: 'Система Чести',
            desc:  'Победы → Публичный Статус → доступ в Закрытые Города и Элитный Клуб',
          },
        ].map(item => (
          <div key={item.title} className="glass-card p-4 text-center border border-[rgba(192,160,64,0.1)]">
            <div className="text-2xl mb-2 opacity-60">{item.icon}</div>
            <div className="font-display text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
              {item.title}
            </div>
            <div className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
