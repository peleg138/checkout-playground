import React from 'react'

interface InputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
  error?: string
  rightSlot?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  id?: string
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  rightSlot,
  className = '',
  style,
  disabled,
  id,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        style={style}
        className={[
          'flex items-center h-10 rounded-[6px] border bg-white px-3 py-2 gap-1 transition-all',
          error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            : 'border-[#e5e7eb] focus-within:border-[#448ae3] focus-within:ring-2 focus-within:ring-[#448ae3]/20',
          className,
        ].join(' ')}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] leading-5 font-normal text-[#09090b] placeholder:text-[#71717a] disabled:opacity-50"
        />
        {rightSlot && <div className="flex-shrink-0 flex items-center">{rightSlot}</div>}
      </div>
      {error && (
        <span className="text-[12px] leading-4 text-red-500">{error}</span>
      )}
    </div>
  )
}
