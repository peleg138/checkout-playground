import React from 'react'
import { Image } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { RangeSlider } from '../ui/RangeSlider'
import type { BackgroundConfig } from '../types'

interface Props {
  config: BackgroundConfig
  onChange: (c: BackgroundConfig) => void
}

export function MediaSection({ config, onChange }: Props) {
  const hasImage = !!config.imageUrl

  return (
    <ConfigSection title="Background & Media" icon={<Image size={15} />} defaultOpen={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {!hasImage && (
          <span style={{ fontSize: 12, color: '#a1a1aa' }}>
            No background — upload via{' '}
            <span style={{ color: '#6366f1', fontWeight: 500 }}>Assets</span> panel
          </span>
        )}

        {hasImage && (
          <>
            <ControlRow label="Opacity">
              <div style={{ width: 120 }}>
                <RangeSlider value={config.opacity} min={10} max={100} step={5} onChange={v => onChange({ ...config, opacity: v })} unit="%" />
              </div>
            </ControlRow>

            <ControlRow label="Dark Overlay">
              <div style={{ width: 120 }}>
                <RangeSlider value={config.overlay} min={0} max={80} step={5} onChange={v => onChange({ ...config, overlay: v })} unit="%" />
              </div>
            </ControlRow>

          </>
        )}
      </div>
    </ConfigSection>
  )
}
