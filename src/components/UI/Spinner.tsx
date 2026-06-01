import React from 'react'

interface SpinnerProps {
  size?: number
  color?: 'white' | 'blue' | 'gray'
}

export function Spinner({ size = 24, color = 'blue' }: SpinnerProps) {
  const colors = {
    white: 'border-white/30 border-t-white',
    blue: 'border-blue-200 border-t-blue-500',
    gray: 'border-gray-200 border-t-gray-500',
  }

  return (
    <div
      className={`rounded-full border-2 animate-spin ${colors[color]}`}
      style={{ width: size, height: size }}
    />
  )
}
