import React from 'react'
import { ShoppingBag, Plus, X } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { Toggle } from '../ui/Toggle'
import type { ProductsConfig, ProductItem } from '../types'

interface Props {
  config: ProductsConfig
  onChange: (c: ProductsConfig) => void
  isOpen?: boolean
  onToggle?: () => void
}

const inputStyle: React.CSSProperties = {
  height: 28,
  border: '1px solid #e4e4e7',
  borderRadius: 6,
  padding: '0 8px',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#3f3f46',
  background: '#fff',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

export function ProductsSection({ config, onChange, isOpen, onToggle }: Props) {
  const updateItem = (idx: number, field: keyof ProductItem, value: string) => {
    const items = config.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    onChange({ ...config, items })
  }

  const removeItem = (idx: number) => {
    onChange({ ...config, items: config.items.filter((_, i) => i !== idx) })
  }

  const addItem = () => {
    const newItem: ProductItem = { id: Date.now().toString(), name: 'Item', quantity: '1', icon: config.items[0]?.icon ?? '' }
    onChange({ ...config, items: [...config.items, newItem] })
  }

  return (
    <ConfigSection title="Products" icon={<ShoppingBag size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: 2 }}>Offer</span>
        <ControlRow label="Offer Title">
          <input value={config.offerTitle} onChange={e => onChange({ ...config, offerTitle: e.target.value })} style={{ ...inputStyle, width: 120 }} />
        </ControlRow>
        <div style={{ height: 1, background: '#e4e4e7', margin: '8px 0 10px' }} />
        <ControlRow label="Show item icons" labelStyle={{ marginTop: -6 }}>
          <Toggle checked={config.showProductImages} onCheckedChange={v => onChange({ ...config, showProductImages: v })} />
        </ControlRow>
        <div style={{ height: 1, background: '#e4e4e7', margin: '4px 0' }} />

        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa', marginTop: 12, marginBottom: 4 }}>Items</span>

        {config.items.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }} placeholder="Name" />
            <input value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ ...inputStyle, width: 80, flexShrink: 0, fontFamily: 'monospace' }} placeholder="Qty" />
            <button onClick={() => removeItem(idx)} style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 4 }}>
              <X size={12} />
            </button>
          </div>
        ))}

        <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#6366f1', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit', marginTop: 2 }}>
          <Plus size={12} /> Add item
        </button>
      </div>
    </ConfigSection>
  )
}
