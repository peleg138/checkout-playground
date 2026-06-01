import React from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  fullWidth?: boolean
}

// Matches HTML: .s-segs / .s-seg — neutral-100 bg, white active with shadow
export function SegmentedControl<T extends string>({ options, value, onChange, fullWidth }: SegmentedControlProps<T>) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#f4f4f5',
      borderRadius: 8,
      padding: 2,
      gap: 2,
      width: fullWidth ? '100%' : undefined,
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: fullWidth ? '1 1 0%' : undefined,
            minWidth: 0,
            height: 28,
            padding: '0 10px',
            border: 'none',
            background: value === opt.value ? '#fff' : 'transparent',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'inherit',
            color: value === opt.value ? '#18181b' : '#71717a',
            cursor: 'pointer',
            transition: 'background .15s, color .15s, box-shadow .15s',
            boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
