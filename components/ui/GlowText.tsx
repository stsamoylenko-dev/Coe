import { HTMLAttributes } from 'react'

interface GlowTextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
  color?: string
}

export default function GlowText({ as: Tag = 'span', color, className = '', children, style, ...props }: GlowTextProps) {
  return (
    <Tag
      className={`glow-text ${className}`}
      style={{
        color: color ?? 'var(--color-emerald)',
        textShadow: `0 0 10px ${color ?? 'rgba(0,200,112,0.5)'}, 0 0 20px ${color ?? 'rgba(0,200,112,0.3)'}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}
