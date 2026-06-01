import React, { useRef, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { Toggle } from '../ui/Toggle'
import { SegmentedControl } from '../ui/SegmentedControl'
import type { PaymentMethodConfig, CheckoutModeConfig } from '../types'
import applePaySrc from '../../assets/icons/express.png'
import googlePaySrc from '../../assets/icons/express-gpay.png'
import paypalSrc from '../../assets/icons/express-paypal.png'

const EXPRESS_BUTTON_OPTIONS: Array<{ value: 'apple' | 'google' | 'paypal'; src: string; label: string }> = [
  { value: 'apple',  src: applePaySrc,  label: 'Apple Pay' },
  { value: 'google', src: googlePaySrc, label: 'Google Pay' },
  { value: 'paypal', src: paypalSrc,    label: 'PayPal' },
]

interface Props {
  methods: PaymentMethodConfig[]
  onChange: (methods: PaymentMethodConfig[]) => void
  checkoutMode: CheckoutModeConfig
  onCheckoutModeChange: (c: CheckoutModeConfig) => void
  isOpen?: boolean
  onToggle?: () => void
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Card',
  paypal: 'PayPal',
  gpay: 'Google Pay',
  other: 'Other',
}

function DragHandle() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" style={{ display: 'block' }}>
      <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      <circle cx="8" cy="4" r="1.5" fill="currentColor" />
      <circle cx="4" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function PaymentMethodsSection({ methods, onChange, checkoutMode, onCheckoutModeChange, isOpen, onToggle }: Props) {
  const sorted = [...methods].sort((a, b) => a.order - b.order)

  const toggle = (id: string) => {
    onChange(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  const dragIdRef = useRef<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [insertBefore, setInsertBefore] = useState(true) // drop indicator above or below

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragIdRef.current = id
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'

    // Canvas must be in the DOM before setDragImage, then removed
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;'
    document.body.appendChild(canvas)
    e.dataTransfer.setDragImage(canvas, 0, 0)
    requestAnimationFrame(() => document.body.removeChild(canvas))
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragIdRef.current === id) return
    setDragOverId(id)

    // Detect if cursor is in top or bottom half — show indicator accordingly
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setInsertBefore(e.clientY < rect.top + rect.height / 2)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the row entirely (not entering a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverId(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = dragIdRef.current
    if (!sourceId || sourceId === targetId) return

    const s = [...methods].sort((a, b) => a.order - b.order)
    const fromIdx = s.findIndex(m => m.id === sourceId)
    let toIdx = s.findIndex(m => m.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...s]
    const [moved] = reordered.splice(fromIdx, 1)
    // Adjust insertion index based on top/bottom half
    const insertIdx = insertBefore
      ? (fromIdx < toIdx ? toIdx - 1 : toIdx)
      : (fromIdx > toIdx ? toIdx + 1 : toIdx)
    reordered.splice(Math.max(0, Math.min(insertIdx, reordered.length)), 0, moved)
    onChange(reordered.map((m, i) => ({ ...m, order: i })))

    setDragOverId(null)
    setDraggingId(null)
    dragIdRef.current = null
  }

  const handleDragEnd = () => {
    setDragOverId(null)
    setDraggingId(null)
    dragIdRef.current = null
  }

  return (
    <ConfigSection title="Payment Methods" icon={<CreditCard size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Express Pay */}
        <div style={{ paddingLeft: 4, paddingRight: 4 }}>
          <ControlRow label="Express Pay">
            <Toggle
              checked={checkoutMode.hasExpressMethods}
              onCheckedChange={v => onCheckoutModeChange({ ...checkoutMode, hasExpressMethods: v })}
            />
          </ControlRow>
        </div>

        {/* Express button type picker */}
        {checkoutMode.hasExpressMethods && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4, paddingRight: 4, paddingBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa' }}>
              Button Type
            </span>
            <SegmentedControl
              fullWidth
              options={[
                { value: 'apple',  label: 'Apple' },
                { value: 'google', label: 'Google' },
                { value: 'paypal', label: 'PayPal' },
              ]}
              value={checkoutMode.expressButtonType}
              onChange={v => onCheckoutModeChange({ ...checkoutMode, expressButtonType: v as 'apple' | 'google' | 'paypal' })}
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#e4e4e7' }} />

        {/* Payment method rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map((method) => {
          const isDragging = draggingId === method.id
          const isOver = dragOverId === method.id

          return (
            <div
              key={method.id}
              draggable
              onDragStart={e => handleDragStart(e, method.id)}
              onDragOver={e => handleDragOver(e, method.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, method.id)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 6,
                position: 'relative',
                padding: '4px 4px 4px 2px',
                opacity: isDragging ? 0.3 : 1,
                background: isOver ? '#f5f5ff' : 'transparent',
                transition: 'opacity .15s, background .1s',
                cursor: isDragging ? 'grabbing' : 'auto',
              }}
            >
              {/* Straight drop indicator line — absolutely positioned, no border-radius */}
              {isOver && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: '#6366f1',
                  borderRadius: 0,
                  pointerEvents: 'none',
                  ...(insertBefore ? { top: 0 } : { bottom: 0 }),
                }} />
              )}
              {/* Drag handle */}
              <span
                draggable={false}
                style={{
                  color: isDragging ? '#6366f1' : '#c4c4cc',
                  cursor: 'grab',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 2,
                  userSelect: 'none',
                  transition: 'color .15s',
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              >
                <DragHandle />
              </span>

              <div style={{ flex: 1 }}>
                <ControlRow label={METHOD_LABELS[method.id] ?? method.id}>
                  <Toggle checked={method.enabled} onCheckedChange={() => toggle(method.id)} />
                </ControlRow>
              </div>
            </div>
          )
        })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e4e4e7' }} />

        {/* User State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa' }}>
            User State
          </span>
          <SegmentedControl
            fullWidth
            options={[
              { value: 'new', label: 'New Card' },
              { value: 'saved', label: 'Saved Card' },
            ]}
            value={checkoutMode.userMode}
            onChange={v => onCheckoutModeChange({ ...checkoutMode, userMode: v })}
          />
        </div>

      </div>
    </ConfigSection>
  )
}
