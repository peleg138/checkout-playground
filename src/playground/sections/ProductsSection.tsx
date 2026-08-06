import React, { useState } from 'react'
import { ShoppingBag, Plus, X, ChevronDown, ChevronRight } from 'lucide-react'
import { ConfigSection } from '../ui/ConfigSection'
import type { ProductsConfig, ProductItem, MultiOffer, MultiOfferSubItem } from '../types'

interface Props {
  config: ProductsConfig
  onChange: (c: ProductsConfig) => void
  isOpen?: boolean
  onToggle?: () => void
  isMultiOffers?: boolean
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

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: '#a1a1aa',
  marginBottom: 4,
}

/** Scoped styles for the offer editor — hover/focus states inline styles can't express. */
const EDITOR_CSS = `
.pg-offer { border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; transition: border-color .15s, box-shadow .15s; }
.pg-offer[data-open="true"] { border-color: #d4d4d8; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.pg-offer-head { display: flex; align-items: center; gap: 6px; padding: 7px 8px 7px 10px; background: #fafafa; cursor: pointer; user-select: none; }
.pg-offer-head:hover { background: #f4f4f5; }
.pg-icon-btn { width: 20px; height: 20px; border: none; background: transparent; cursor: pointer; color: #a1a1aa; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 4px; transition: color .12s, background .12s; }
.pg-icon-btn:hover { color: #52525b; background: #f4f4f5; }
.pg-input:focus { border-color: #a5b4fc; box-shadow: 0 0 0 2px rgba(99,102,241,.14); }
.pg-items { border: 1px solid #e4e4e7; border-radius: 6px; overflow: hidden; }
.pg-item-row { display: flex; align-items: center; gap: 6px; padding: 4px 4px 4px 8px; }
.pg-item-row + .pg-item-row { border-top: 1px solid #f4f4f5; }
.pg-item-row:hover { background: #fafafa; }
.pg-item-row input { border: none; background: transparent; outline: none; font-family: inherit; font-size: 13px; color: #3f3f46; min-width: 0; padding: 3px 0; }
.pg-item-row input::placeholder { color: #c4c4cc; }
.pg-add { display: flex; align-items: center; gap: 5px; width: 100%; border: none; border-top: 1px solid #f4f4f5; background: transparent; font-size: 12px; font-weight: 500; color: #6366f1; cursor: pointer; padding: 6px 8px; font-family: inherit; }
.pg-add:hover { background: #f5f5ff; }
.pg-count { font-size: 11px; font-weight: 500; color: #a1a1aa; flex-shrink: 0; font-variant-numeric: tabular-nums; }
/* Native spinners crowd the 60px badge field; the chip preview conveys the value instead. */
.pg-num::-webkit-inner-spin-button, .pg-num::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.pg-num { -moz-appearance: textfield; appearance: textfield; }
.pg-affix { position: relative; display: flex; align-items: center; }
.pg-affix > span { position: absolute; left: 8px; font-size: 13px; color: #a1a1aa; pointer-events: none; }
`

function MultiOfferEditor({ offer, idx, onChange, onRemove }: {
  offer: MultiOffer
  idx: number
  onChange: (updated: MultiOffer) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)

  const updateSubItem = (j: number, field: keyof MultiOfferSubItem, value: string) => {
    const items = offer.items.map((it, i) => i === j ? { ...it, [field]: value } : it)
    onChange({ ...offer, items })
  }

  const removeSubItem = (j: number) => {
    onChange({ ...offer, items: offer.items.filter((_, i) => i !== j) })
  }

  const addSubItem = () => {
    onChange({ ...offer, items: [...offer.items, { name: 'Item', qty: '1' }] })
  }

  return (
    <div className="pg-offer" data-open={open}>
      {/* Offer header row */}
      <div className="pg-offer-head" onClick={() => setOpen(v => !v)}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a', flexShrink: 0 }}>#{idx + 1}</span>
        <span style={{ fontSize: 13, color: '#3f3f46', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {offer.title.replace(/\n/g, ' ') || 'Untitled'}
        </span>
        {!open && <span className="pg-count">{offer.price}</span>}
        <button
          className="pg-icon-btn"
          onClick={e => { e.stopPropagation(); onRemove() }}
          aria-label={`Remove offer ${idx + 1}`}
        >
          <X size={11} />
        </button>
        {open ? <ChevronDown size={13} color="#a1a1aa" /> : <ChevronRight size={13} color="#a1a1aa" />}
      </div>

      {open && (
        <div style={{ padding: '10px 10px 10px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #f0f0f5' }}>
          {/* Title */}
          <div>
            <span style={{ ...labelStyle, marginBottom: 3, display: 'block' }}>Title</span>
            <textarea
              className="pg-input"
              value={offer.title}
              onChange={e => onChange({ ...offer, title: e.target.value })}
              rows={2}
              style={{ ...inputStyle, height: 'auto', resize: 'none', padding: '5px 8px', lineHeight: '1.4', fontFamily: 'inherit' }}
              placeholder="Offer title (use \n for line break)"
            />
          </div>

          {/* Price + Badge qty */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ ...labelStyle, marginBottom: 3, display: 'block' }}>Price</span>
              <input
                className="pg-input"
                value={offer.price}
                onChange={e => onChange({ ...offer, price: e.target.value })}
                style={inputStyle}
                placeholder="$4.99"
              />
            </div>
            <div style={{ width: 72 }}>
              <span style={{ ...labelStyle, marginBottom: 3, display: 'block' }}>Amount</span>
              <div className="pg-affix">
                <span>x</span>
                <input
                  className="pg-input pg-num"
                  type="number"
                  min={0}
                  value={offer.qty}
                  onChange={e => onChange({ ...offer, qty: Math.max(0, parseInt(e.target.value) || 0) })}
                  style={{ ...inputStyle, paddingLeft: 18 }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Sub-items */}
          <div>
            <span style={{ ...labelStyle, marginTop: 4, marginBottom: 4, display: 'block' }}>Items</span>
            <div className="pg-items">
              {offer.items.map((it, j) => (
                <div key={j} className="pg-item-row">
                  <input value={it.name} onChange={e => updateSubItem(j, 'name', e.target.value)} style={{ flex: 1 }} placeholder="Item name" />
                  <input value={it.qty} onChange={e => updateSubItem(j, 'qty', e.target.value)} style={{ width: 44, flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }} placeholder="0" />
                  <button className="pg-icon-btn" onClick={() => removeSubItem(j)} aria-label={`Remove ${it.name || 'item'}`}>
                    <X size={11} />
                  </button>
                </div>
              ))}
              {offer.items.length === 0 && (
                <div style={{ padding: '8px 8px', fontSize: 12, color: '#a1a1aa' }}>No items yet</div>
              )}
              <button className="pg-add" onClick={addSubItem}>
                <Plus size={11} /> Add item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductsSection({ config, onChange, isOpen, onToggle, isMultiOffers = false }: Props) {
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

  const multiOffers = config.multiOffers ?? []

  const updateMultiOffer = (idx: number, updated: MultiOffer) => {
    const next = multiOffers.map((o, i) => i === idx ? updated : o)
    onChange({ ...config, multiOffers: next })
  }

  const removeMultiOffer = (idx: number) => {
    onChange({ ...config, multiOffers: multiOffers.filter((_, i) => i !== idx), offerCount: Math.max(1, (config.offerCount ?? multiOffers.length) - 1) })
  }

  const addMultiOffer = () => {
    const newOffer: MultiOffer = {
      id: Date.now().toString(),
      title: 'New Offer',
      price: '$0.00',
      qty: 0,
      items: [],
    }
    onChange({ ...config, multiOffers: [...multiOffers, newOffer], offerCount: (config.offerCount ?? multiOffers.length) + 1 })
  }

  return (
    <ConfigSection title={isMultiOffers ? 'Offers' : 'Products'} icon={<ShoppingBag size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <style>{EDITOR_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!isMultiOffers && (
          <>
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
          </>
        )}

        {isMultiOffers && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {multiOffers.map((offer, idx) => (
              <MultiOfferEditor
                key={offer.id}
                offer={offer}
                idx={idx}
                onChange={updated => updateMultiOffer(idx, updated)}
                onRemove={() => removeMultiOffer(idx)}
              />
            ))}
            <button onClick={addMultiOffer} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#6366f1', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit', marginTop: 2 }}>
              <Plus size={12} /> Add offer
            </button>
          </div>
        )}
      </div>
    </ConfigSection>
  )
}
