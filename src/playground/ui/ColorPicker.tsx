import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Color conversion helpers ────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6)
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** RGB (0–255) → HSV (h: 0–360, s: 0–100, v: 0–100) */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100)
  const v = Math.round(max * 100)
  return [h, s, v]
}

/** HSV (h: 0–360, s: 0–100, v: 0–100) → RGB (0–255) */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sn = s / 100
  const vn = v / 100
  const c = vn * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vn - c

  let r = 0
  let g = 0
  let b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

function hsvToHex(h: number, s: number, v: number): string {
  const [r, g, b] = hsvToRgb(h, s, v)
  return rgbToHex(r, g, b)
}

function hexToHsv(hex: string): [number, number, number] {
  if (!/^#[0-9a-fA-F]{3,6}$/.test(hex)) return [0, 0, 100]
  const [r, g, b] = hexToRgb(hex)
  return rgbToHsv(r, g, b)
}

// ─── Clamp ───────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

// ─── Drag hook ───────────────────────────────────────────────────────────────

function usePointerDrag(
  onMove: (e: PointerEvent) => void,
  onEnd?: () => void,
) {
  const active = useRef(false)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      active.current = true
      // Dispatch an initial synthetic move so click = instant color change
      onMove(e.nativeEvent)

      const handleMove = (ev: PointerEvent) => {
        if (active.current) onMove(ev)
      }
      const handleUp = () => {
        active.current = false
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        onEnd?.()
      }
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [onMove, onEnd],
  )

  return onPointerDown
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  onSavePreset?: (color: string) => void
}

export function ColorPicker({ value, onChange, onSavePreset }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Derive HSV from the incoming hex. We keep a local HSV state so dragging
  // is smooth even when hex rounding loses precision.
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value))
  const [hexInput, setHexInput] = useState(value.toUpperCase())

  // Sync from outside when prop changes
  const prevValue = useRef(value)
  if (prevValue.current !== value) {
    prevValue.current = value
    const next = hexToHsv(value)
    setHsv(next)
    setHexInput(value.toUpperCase())
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPopoverPos({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(o => !o)
  }

  const commitHsv = useCallback(
    (newHsv: [number, number, number]) => {
      setHsv(newHsv)
      const hex = hsvToHex(...newHsv)
      setHexInput(hex.toUpperCase())
      onChange(hex)
    },
    [onChange],
  )

  // ── Gradient canvas (saturation / value) ──────────────────────────────────
  const svRef = useRef<HTMLDivElement>(null)

  const moveSV = useCallback(
    (e: PointerEvent) => {
      const el = svRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const s = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 100), 0, 100)
      const v = clamp(Math.round((1 - (e.clientY - rect.top) / rect.height) * 100), 0, 100)
      commitHsv([hsv[0], s, v])
    },
    [hsv, commitHsv],
  )

  const onSVDown = usePointerDrag(moveSV)

  // ── Hue slider ─────────────────────────────────────────────────────────────
  const hueRef = useRef<HTMLDivElement>(null)

  const moveHue = useCallback(
    (e: PointerEvent) => {
      const el = hueRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const h = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 360), 0, 360)
      commitHsv([h, hsv[1], hsv[2]])
    },
    [hsv, commitHsv],
  )

  const onHueDown = usePointerDrag(moveHue)

  // ── Derived display values ─────────────────────────────────────────────────
  const [h, s, v] = hsv
  const hueColor = `hsl(${h}, 100%, 50%)`

  const svThumbLeft = `${s}%`
  const svThumbTop = `${100 - v}%`
  const hueThumbLeft = `${(h / 360) * 100}%`

  // ── Hex text input ─────────────────────────────────────────────────────────
  const handleHexChange = (raw: string) => {
    setHexInput(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      const newHsv = hexToHsv(raw)
      setHsv(newHsv)
      onChange(raw.toLowerCase())
    }
  }

  const handleHexBlur = () => {
    // Revert to canonical hex if input is incomplete
    const canonical = hsvToHex(h, s, v).toUpperCase()
    setHexInput(canonical)
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* ── Combined swatch + hex trigger ── */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 32,
          padding: '0 8px 0 6px',
          border: open ? '1px solid #6366f1' : '1px solid #e4e4e7',
          borderRadius: 8,
          background: '#fff',
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 2px rgba(99,102,241,.12)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          userSelect: 'none',
          minWidth: 0,
          width: 130,
        }}
      >
        {/* Swatch */}
        <div style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: hsvToHex(h, s, v),
          border: '1px solid rgba(0,0,0,.12)',
          flexShrink: 0,
        }} />
        {/* Hex text — inline editable */}
        <input
          type="text"
          value={hexInput}
          onChange={e => {
            const v = e.target.value
            if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
              handleHexChange(v.startsWith('#') ? v : '#' + v)
            }
          }}
          onBlur={handleHexBlur}
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#3f3f46',
            letterSpacing: '0.04em',
            minWidth: 0,
            cursor: 'text',
          }}
          spellCheck={false}
        />
        {/* Chevron */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <path d="M2 3.5l3 3 3-3" stroke="#3f3f46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── Popover ── */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 9999,
            width: 240,
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08)',
            padding: 12,
            boxSizing: 'border-box',
            userSelect: 'none',
          }}
        >
          {/* ── SV gradient square ── */}
          <div
            ref={svRef}
            onPointerDown={onSVDown}
            style={{
              position: 'relative',
              width: '100%',
              height: 160,
              borderRadius: 6,
              cursor: 'crosshair',
              overflow: 'hidden',
              marginBottom: 10,
              background: hueColor,
              flexShrink: 0,
            }}
          >
            {/* White saturation gradient (left→right) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #fff 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            {/* Black value gradient (top→bottom) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, #000 100%)',
                pointerEvents: 'none',
              }}
            />
            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: svThumbLeft,
                top: svThumbTop,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,.35), 0 1px 4px rgba(0,0,0,.25)',
                pointerEvents: 'none',
                background: hsvToHex(h, s, v),
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ── Hue slider ── */}
          <div
            ref={hueRef}
            onPointerDown={onHueDown}
            style={{
              position: 'relative',
              width: '100%',
              height: 12,
              borderRadius: 6,
              background:
                'linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))',
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: hueThumbLeft,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,.3), 0 1px 4px rgba(0,0,0,.2)',
                background: hueColor,
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ── Bottom row: swatch preview + hex input ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Live color preview swatch */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,.12)',
                background: hsvToHex(h, s, v),
                flexShrink: 0,
              }}
            />
            {/* Hex input */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #e4e4e7', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
              <span style={{ padding: '0 4px 0 7px', fontSize: 11, color: '#a1a1aa', fontFamily: 'monospace', lineHeight: '28px' }}>#</span>
              <input
                type="text"
                value={hexInput.replace('#', '')}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                  setHexInput('#' + raw.toUpperCase())
                  if (raw.length === 6) {
                    const full = '#' + raw
                    const newHsv = hexToHsv(full)
                    setHsv(newHsv)
                    onChange(full.toLowerCase())
                  }
                }}
                onBlur={handleHexBlur}
                style={{
                  flex: 1,
                  height: 28,
                  border: 'none',
                  padding: '0 6px 0 0',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#3f3f46',
                  background: 'transparent',
                  outline: 'none',
                  letterSpacing: '0.02em',
                  minWidth: 0,
                }}
                spellCheck={false}
              />
            </div>
            {/* Save preset button */}
            {onSavePreset && (
              <button
                onClick={() => { onSavePreset(hsvToHex(h, s, v)); setOpen(false); }}
                title="Save as preset"
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid #e4e4e7',
                  borderRadius: 6,
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#6366f1',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  fontSize: 18,
                  lineHeight: 1,
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e4e7')}
              >
                +
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
