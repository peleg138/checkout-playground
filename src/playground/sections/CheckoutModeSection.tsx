import React from 'react'
import { Layers } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { Toggle } from '../ui/Toggle'
import { SegmentedControl } from '../ui/SegmentedControl'
import type { CheckoutModeConfig } from '../types'

interface Props {
  config: CheckoutModeConfig
  onChange: (c: CheckoutModeConfig) => void
}

export function CheckoutModeSection({ config, onChange }: Props) {
  return (
    <ConfigSection title="Checkout Mode" icon={<Layers size={15} />} defaultOpen={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ControlRow label="Express Pay">
          <Toggle
            checked={config.hasExpressMethods}
            onCheckedChange={v => onChange({ ...config, hasExpressMethods: v })}
          />
        </ControlRow>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa' }}>
            User State
          </span>
          <SegmentedControl
            fullWidth
            options={[
              { value: 'new', label: 'New Card' },
              { value: 'saved', label: 'Saved Card' },
            ]}
            value={config.userMode}
            onChange={v => onChange({ ...config, userMode: v })}
          />
        </div>
      </div>
    </ConfigSection>
  )
}
