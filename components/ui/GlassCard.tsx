import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  children: React.ReactNode
}

export default function GlassCard({ glow, className = '', children, ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${glow ? 'shadow-[0_0_20px_rgba(0,200,112,0.25)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
