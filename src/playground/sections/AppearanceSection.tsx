import React, { useState } from 'react'
import { Palette } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { ColorPicker } from '../ui/ColorPicker'
import { RangeSlider } from '../ui/RangeSlider'
import { Toggle } from '../ui/Toggle'
import type { AppearanceConfig, BackgroundConfig } from '../types'

interface Props {
  config: AppearanceConfig
  onChange: (c: AppearanceConfig) => void
  background: BackgroundConfig
  onBackgroundChange: (c: BackgroundConfig) => void
  isOpen?: boolean
  onToggle?: () => void
}

const DEFAULT_PRESETS = [
  '#448ae3', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#10b981', '#0ea5e9',
]

export function AppearanceSection({ config, onChange, background, onBackgroundChange, isOpen, onToggle }: Props) {
  const hasImage = !!background.imageUrl
  const [userPresets, setUserPresets] = useState<string[]>([])

  const allPresets = [...DEFAULT_PRESETS, ...userPresets]

  const savePreset = (color: string) => {
    if (!allPresets.includes(color.toLowerCase()) && !allPresets.includes(color.toUpperCase()) && !allPresets.map(c => c.toLowerCase()).includes(color.toLowerCase())) {
      setUserPresets(prev => [...prev, color])
    }
  }

  return (
    <ConfigSection title="Appearance" icon={<Palette size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ControlRow label="Primary Color">
          <ColorPicker
            value={config.primaryColor}
            onChange={v => onChange({ ...config, primaryColor: v })}
            onSavePreset={savePreset}
          />
        </ControlRow>

        {/* Color presets */}
        <div style={{ height: 1, background: '#e4e4e7', marginTop: 4 }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa', marginTop: 4 }}>
          Presets
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 4 }}>
          {DEFAULT_PRESETS.map(color => (
            <button
              key={color}
              onClick={() => onChange({ ...config, primaryColor: color })}
              title={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: color,
                border: config.primaryColor.toLowerCase() === color.toLowerCase() ? '2.5px solid #18181b' : '2.5px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform .12s',
                transform: config.primaryColor.toLowerCase() === color.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
          {userPresets.map(color => (
            <button
              key={color}
              onClick={() => onChange({ ...config, primaryColor: color })}
              title={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: color,
                border: config.primaryColor.toLowerCase() === color.toLowerCase() ? '2.5px solid #18181b' : '2.5px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform .12s',
                transform: config.primaryColor.toLowerCase() === color.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e4e4e7' }} />

        {/* Background type toggle */}
        <ControlRow label="Background">
          <div style={{ display: 'flex', alignItems: 'center', background: '#f4f4f5', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['white', 'image'] as const).map(type => (
              <button
                key={type}
                onClick={() => onBackgroundChange({ ...background, backgroundType: type })}
                style={{
                  height: 26,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background .12s, color .12s, box-shadow .12s',
                  background: background.backgroundType === type ? '#fff' : 'transparent',
                  color: background.backgroundType === type ? '#18181b' : '#71717a',
                  boxShadow: background.backgroundType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {type === 'white' ? 'White' : 'Image'}
              </button>
            ))}
          </div>
        </ControlRow>

        {/* Image-only controls */}
        {background.backgroundType === 'image' && (
          <>
            {!hasImage && (
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                No background — upload via{' '}
                <span style={{ color: '#6366f1', fontWeight: 500 }}>Assets</span> panel
              </span>
            )}
            {hasImage && (
              <ControlRow label="Dark Overlay">
                <div style={{ width: 120 }}>
                  <RangeSlider value={background.overlay} min={0} max={80} step={5} onChange={v => onBackgroundChange({ ...background, overlay: v })} unit="%" />
                </div>
              </ControlRow>
            )}
          </>
        )}
      </div>
    </ConfigSection>
  )
}
