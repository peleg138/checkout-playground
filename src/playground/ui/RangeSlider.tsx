import React from 'react'
import * as Slider from '@radix-ui/react-slider'

interface RangeSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  unit?: string
}

export function RangeSlider({ value, min, max, step = 1, onChange, unit }: RangeSliderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        style={{ position: 'relative', display: 'flex', flex: 1, height: 16, alignItems: 'center', userSelect: 'none', touchAction: 'none' }}
      >
        <Slider.Track style={{ position: 'relative', height: 3, flex: 1, borderRadius: 999, background: '#e4e4e7', overflow: 'visible' }}>
          <Slider.Range style={{ position: 'absolute', height: '100%', borderRadius: 999, background: '#6366f1' }} />
        </Slider.Track>
        <Slider.Thumb
          style={{
            display: 'block',
            width: 13,
            height: 13,
            borderRadius: '50%',
            background: '#fff',
            border: '1.5px solid #d4d4d8',
            boxShadow: '0 1px 3px rgba(0,0,0,.1)',
            outline: 'none',
            cursor: 'grab',
            transition: 'border-color .15s',
          }}
        />
      </Slider.Root>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#71717a', width: 36, textAlign: 'right', flexShrink: 0 }}>
        {value}{unit}
      </span>
    </div>
  )
}
