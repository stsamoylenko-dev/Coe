import { ButtonHTMLAttributes } from 'react'

interface MetalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function MetalButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: MetalButtonProps) {
  const base = `
    metal-btn font-display font-semibold tracking-widest uppercase
    transition-all duration-200 active:scale-95
    disabled:opacity-40 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `
  const variantClass =
    variant === 'primary'
      ? 'text-[var(--color-emerald)] border-[var(--color-emerald-dim)] hover:border-[var(--color-emerald)] hover:shadow-[var(--glow-emerald-sm)]'
      : 'text-[var(--color-text-secondary)] border-[var(--color-metal-mid)] hover:text-[var(--color-emerald)] hover:border-[var(--color-emerald-dim)]'

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  )
}
