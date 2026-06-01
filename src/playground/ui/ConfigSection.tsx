import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfigSectionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  /** Controlled open state — if provided, internal state is ignored */
  isOpen?: boolean
  /** Called when the header is clicked in controlled mode */
  onToggle?: () => void
  children: React.ReactNode
}

export function ConfigSection({ title, icon, defaultOpen = false, isOpen, onToggle, children }: ConfigSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const controlled = isOpen !== undefined
  const open = controlled ? isOpen : internalOpen
  const toggle = controlled ? onToggle! : () => setInternalOpen(o => !o)

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Tab row — 45px */}
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 45,
          padding: '0 16px 0 14px',
          border: 'none',
          background: '#fff',
          cursor: 'pointer',
          gap: 8,
          transition: 'background .12s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = '#fafafa' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
      >
        {/* Icon */}
        <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: open ? '#6366f1' : '#71717a', transition: 'color .12s' }}>
          {icon}
        </span>

        {/* Label */}
        <span style={{
          flex: 1,
          fontSize: 14,
          fontWeight: open ? 500 : 400,
          lineHeight: '20px',
          color: open ? '#6366f1' : '#71717a',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color .12s',
        }}>
          {title}
        </span>

        {/* Chevron */}
        <span style={{ width: 18, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: open ? '#6366f1' : '#71717a', transition: 'color .12s' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: 'transform .2s cubic-bezier(0.4,0,0.2,1)', transform: open ? 'rotate(90deg)' : 'none' }}>
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '10px 16px 18px 16px', borderBottom: '1px solid #e4e4e7', background: '#fff' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row separator when closed */}
      {!open && <div style={{ height: 1, background: '#f0f0f5' }} />}
    </div>
  )
}

// ControlRow — label + right-aligned control, no hint text
export function ControlRow({
  label,
  children,
  labelStyle,
}: {
  label: string
  children: React.ReactNode
  hint?: string  // kept for API compat, no longer rendered
  labelStyle?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 34, gap: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 500, lineHeight: '18px', color: '#3f3f46', flexShrink: 0, ...labelStyle }}>
        {label}
      </span>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

export function ControlGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
}
