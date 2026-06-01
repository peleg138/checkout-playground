import React from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'apple'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 select-none transition-all duration-150'

  const variants: Record<string, string> = {
    primary:
      'h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a7bd0] active:bg-[#3370c0]',
    outline:
      'h-11 rounded-[6px] bg-white text-[14px] leading-5 font-medium text-[#448ae3] border border-[#448ae3] px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50',
    ghost:
      'h-11 rounded-[6px] bg-transparent text-[14px] font-medium text-[#71717a] px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100',
    apple:
      'h-11 rounded-[6px] bg-[#09090b] text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]',
  }

  return (
    <button
      className={[
        base,
        variants[variant] ?? variants.primary,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={18} color={variant === 'primary' || variant === 'apple' ? 'white' : 'blue'} />
      ) : (
        children
      )}
    </button>
  )
}
