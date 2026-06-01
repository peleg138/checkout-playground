import React from 'react'
import * as Switch from '@radix-ui/react-switch'

interface ToggleProps {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onCheckedChange, disabled }: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        flexShrink: 0,
        border: 'none',
        borderRadius: 10,
        background: checked ? '#6366f1' : '#d4d4d8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .18s',
        padding: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Switch.Thumb
        style={{
          display: 'block',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.18)',
          position: 'absolute',
          top: '50%',
          transform: checked ? 'translateX(18px) translateY(-50%)' : 'translateX(2px) translateY(-50%)',
          transition: 'transform .18s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </Switch.Root>
  )
}
