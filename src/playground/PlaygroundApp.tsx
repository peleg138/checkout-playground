import React, { useState } from 'react'
import { RotateCcw, Smartphone, Monitor } from 'lucide-react'
import appchargeLogo from '../assets/icons/appcharge-logo.png'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfigPanel } from './components/ConfigPanel'
import { AssetsPanel } from './components/AssetsPanel'
import { CheckoutPreviewWrapper } from './components/CheckoutPreviewWrapper'
import { DEFAULT_CONFIG } from './defaultConfig'
import type { PlaygroundConfig } from './types'

type Orientation = 'portrait' | 'landscape' | 'desktop'

export function PlaygroundApp() {
  const [config, setConfig] = useState<PlaygroundConfig>(DEFAULT_CONFIG)
  const [previewKey, setPreviewKey] = useState(0)
  const [orientation, setOrientation] = useState<Orientation>('portrait')

  const reset = () => {
    setConfig(DEFAULT_CONFIG)
    setPreviewKey(k => k + 1)
  }

  const isLandscape = orientation === 'landscape'
  const isDesktop = orientation === 'desktop'

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#f0f0f2', minWidth: 760, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <header
        className="flex-shrink-0 flex items-center"
        style={{
          height: 64,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)',
          padding: '0 28px',
          position: 'relative',
          zIndex: 20,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src={appchargeLogo}
            alt="Appcharge"
            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', flexShrink: 0 }}
            draggable={false}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>Appcharge</span>
        </div>

        {/* Orientation toggle — centred */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', background: '#f4f4f5', borderRadius: 8, padding: 3, gap: 2 }}>
          <button
            onClick={() => setOrientation('portrait')}
            title="Portrait"
            style={{
              width: 32, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: orientation === 'portrait' ? '#fff' : 'transparent',
              color: orientation === 'portrait' ? '#18181b' : '#71717a',
              transition: 'background .15s, color .15s',
              fontFamily: 'inherit',
            }}
          >
            <Smartphone size={14} />
          </button>
          <button
            onClick={() => setOrientation('landscape')}
            title="Landscape"
            style={{
              width: 32, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isLandscape ? '#fff' : 'transparent',
              color: isLandscape ? '#18181b' : '#71717a',
              transition: 'background .15s, color .15s',
              fontFamily: 'inherit',
            }}
          >
            <Smartphone size={14} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button
            onClick={() => setOrientation('desktop')}
            title="Desktop"
            style={{
              width: 32, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDesktop ? '#fff' : 'transparent',
              color: isDesktop ? '#18181b' : '#71717a',
              transition: 'background .15s, color .15s',
              fontFamily: 'inherit',
            }}
          >
            <Monitor size={14} />
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div className="flex items-center" style={{ gap: 8 }}>

          <button
            onClick={reset}
            className="flex items-center gap-1.5"
            style={{
              height: 34,
              padding: '0 16px',
              background: '#6366f1',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 0 5px rgba(99,102,241,.5)',
              transition: 'background .15s, box-shadow .15s',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px rgba(99,102,241,.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#6366f1'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 5px rgba(99,102,241,.5)'
            }}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </header>

      {/* ── Editor body ── */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ gap: 24, padding: 24, height: 'calc(100vh - 64px)' }}
      >
        {/* Left sidebar */}
        <div style={{ width: 318, flexShrink: 0, height: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <ConfigPanel config={config} onChange={setConfig} />
        </div>

        {/* Center canvas */}
        <div
          className="flex-1 overflow-auto scrollbar-hide"
          style={{ borderRadius: 12, background: '#e8e8ea', minWidth: 0, position: 'relative' }}
        >
          {/* Centering wrapper — min-height fills canvas, flex centres the frame.
              min-width: max-content forces the outer div to expand and scroll
              horizontally when the landscape frame is wider than the canvas. */}
          <div style={{ minHeight: '100%', minWidth: 'max-content', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${previewKey}-${orientation}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <CheckoutPreviewWrapper key={previewKey} config={config} orientation={orientation} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right — Assets panel (always visible) */}
        <div style={{ width: 320, flexShrink: 0, height: '100%' }}>
          <AssetsPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </div>
  )
}
