import React from 'react'
import { Tag, X, Plus } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { Toggle } from '../ui/Toggle'
import type { PromoConfig } from '../types'

interface Props {
  config: PromoConfig
  onChange: (c: PromoConfig) => void
  isOpen?: boolean
  onToggle?: () => void
}

const inputStyle: React.CSSProperties = {
  height: 28,
  border: '1px solid #e4e4e7',
  borderRadius: 6,
  padding: '0 8px',
  fontSize: 12,
  fontFamily: 'monospace',
  color: '#3f3f46',
  background: '#fff',
  outline: 'none',
}

export function PromoSection({ config, onChange, isOpen, onToggle }: Props) {
  const addCode = () => {
    onChange({ ...config, validCodes: [...config.validCodes, { code: 'NEWCODE', discount: 2.00, label: 'NEWCODE' }] })
  }

  const removeCode = (idx: number) => {
    onChange({ ...config, validCodes: config.validCodes.filter((_, i) => i !== idx) })
  }

  const updateCode = (idx: number, field: 'code' | 'discount', value: string) => {
    const updated = config.validCodes.map((c, i) => {
      if (i !== idx) return c
      if (field === 'code') return { ...c, code: value.toUpperCase(), label: value.toUpperCase() }
      return { ...c, discount: parseFloat(value) || 0 }
    })
    onChange({ ...config, validCodes: updated })
  }

  return (
    <ConfigSection title="Promo Code" icon={<Tag size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ControlRow label="Show promo field">
          <Toggle checked={config.enabled} onCheckedChange={v => onChange({ ...config, enabled: v })} />
        </ControlRow>

        {config.enabled && (
          <>
            <div style={{ height: 1, background: '#e4e4e7' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa', marginTop: 10 }}>Valid Codes</span>
            {config.validCodes.map((code, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input
                  value={code.code}
                  onChange={e => updateCode(idx, 'code', e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  placeholder="CODE"
                />
                <span style={{ fontSize: 12, color: '#71717a', flexShrink: 0 }}>$</span>
                <input
                  type="number"
                  value={code.discount}
                  onChange={e => updateCode(idx, 'discount', e.target.value)}
                  style={{ ...inputStyle, width: 70 }}
                  step="0.01" min="0"
                />
                <button
                  onClick={() => removeCode(idx)}
                  style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 4 }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={addCode}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                border: 'none', background: 'transparent',
                fontSize: 12, fontWeight: 500, color: '#6366f1',
                cursor: 'pointer', padding: '2px 0',
                fontFamily: 'inherit',
              }}
            >
              <Plus size={12} /> Add code
            </button>
          </>
        )}
      </div>
    </ConfigSection>
  )
}
