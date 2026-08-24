import React, { useState, useEffect, useRef } from 'react'
import { RotateCcw, Smartphone, Monitor, Save, Clock, Trash2, X, Download, Loader2, ChevronDown, Image, Video, Square } from 'lucide-react'
import appchargeLogo from '../assets/icons/appcharge-logo.png'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfigPanel } from './components/ConfigPanel'
import { AssetsPanel } from './components/AssetsPanel'
import { CheckoutPreviewWrapper } from './components/CheckoutPreviewWrapper'
import { DEFAULT_CONFIG } from './defaultConfig'
import { exportScreenPng } from './exportScreen'
import { startScreenRecording } from './recordScreen'
import type { Recording } from './recordScreen'
import type { PlaygroundConfig } from './types'

type Orientation = 'portrait' | 'landscape' | 'desktop'

// ── LocalStorage keys ────────────────────────────────────────────────────────
const CURRENT_KEY   = 'appcharge_playground_current'
const VERSIONS_KEY  = 'appcharge_playground_versions'
const MAX_VERSIONS  = 20

interface SavedVersion {
  id: string
  name: string
  config: PlaygroundConfig
  savedAt: number
}

function loadVersions(): SavedVersion[] {
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) ?? '[]') } catch { return [] }
}

/**
 * Uploaded images are stored inline as base64, so a big one can blow the
 * localStorage quota. setItem throws synchronously when that happens, and an
 * unguarded throw here unmounts the whole playground — a white page. Losing
 * the saved copy is survivable; losing the app is not.
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err) {
    console.warn(`[playground] could not persist "${key}" (${(value.length / 1048576).toFixed(1)}MB). Working copy is unaffected.`, err)
    return false
  }
}

function persistVersions(v: SavedVersion[]) {
  safeSetItem(VERSIONS_KEY, JSON.stringify(v))
}

function loadCurrentConfig(): PlaygroundConfig | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function stripBlobUrls(config: PlaygroundConfig): PlaygroundConfig {
  // blob: URLs are ephemeral — replace with bundled defaults so they survive reload.
  // data: URLs (base64 from FileReader) are safe to persist as-is.
  const isBlob = (s: unknown) => typeof s === 'string' && s.startsWith('blob:')
  return {
    ...config,
    products: {
      ...config.products,
      gameLogo: isBlob(config.products.gameLogo) ? DEFAULT_CONFIG.products.gameLogo : config.products.gameLogo,
      items: config.products.items.map((item, i) => ({
        ...item,
        icon: isBlob(item.icon) ? (DEFAULT_CONFIG.products.items[i]?.icon ?? item.icon) : item.icon,
      })),
    },
    background: {
      ...config.background,
      imageUrl: isBlob(config.background.imageUrl) ? DEFAULT_CONFIG.background.imageUrl : config.background.imageUrl,
      offerImages: (config.background.offerImages ?? [null, null, null]).map(
        (url, i) => isBlob(url) || url === null
          ? (DEFAULT_CONFIG.background.offerImages?.[i] ?? null)
          : url
      ) as [string | null, string | null, string | null],
    },
  }
}


function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)  return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// ── Shared button styles ─────────────────────────────────────────────────────
const ghostBtn: React.CSSProperties = {
  height: 34, padding: '0 14px', border: '1px solid #e4e4e7',
  borderRadius: 8, background: '#fff', color: '#3f3f46',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
  whiteSpace: 'nowrap', fontFamily: 'inherit',
  transition: 'background .12s, border-color .12s',
}

const iconBtn: React.CSSProperties = {
  width: 28, height: 28, border: 'none', background: 'transparent',
  borderRadius: 6, cursor: 'pointer', color: '#71717a',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, transition: 'background .12s, color .12s',
}

function formatElapsed(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

interface ExportMenuItemProps {
  icon: React.ReactNode
  title: string
  detail: string
  onClick: () => void
  divider?: boolean
}

function ExportMenuItem({ icon, title, detail, onClick, divider }: ExportMenuItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        width: '100%', padding: '10px 14px',
        background: 'transparent', border: 'none',
        borderTop: divider ? '1px solid #f4f4f5' : 'none',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', transition: 'background .1s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ color: '#71717a', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#18181b' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>{detail}</span>
      </span>
    </button>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export function PlaygroundApp() {
  const [config, setConfig] = useState<PlaygroundConfig>(
    () => loadCurrentConfig() ?? DEFAULT_CONFIG
  )
  const [previewKey, setPreviewKey]   = useState(0)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [versions, setVersions]       = useState<SavedVersion[]>(loadVersions)
  const [showHistory, setShowHistory] = useState(false)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName]       = useState('')
  const [configTab, setConfigTab]     = useState<'config' | 'multi-offers'>('config')

  const [exporting, setExporting]     = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [recording, setRecording]     = useState(false)
  const [elapsed, setElapsed]         = useState(0)

  const historyRef  = useRef<HTMLDivElement>(null)
  const saveInputRef = useRef<HTMLInputElement>(null)
  const frameRef    = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const recordingRef = useRef<Recording | null>(null)

  // Auto-persist current config
  useEffect(() => {
    safeSetItem(CURRENT_KEY, JSON.stringify(stripBlobUrls(config)))
  }, [config])

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showHistory])

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExportMenu])

  // Focus save input when it appears
  useEffect(() => {
    if (showSaveInput) saveInputRef.current?.focus()
  }, [showSaveInput])

  // Tick the recording timer
  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  // A take left running would keep the tab capture alive after the playground
  // is gone, so drop it if we unmount mid-recording.
  useEffect(() => () => recordingRef.current?.cancel(), [])

  const reset = () => {
    setConfig(DEFAULT_CONFIG)
    setPreviewKey(k => k + 1)
  }

  const saveVersion = () => {
    const name = saveName.trim() || `Version ${versions.length + 1}`
    const entry: SavedVersion = {
      id: Date.now().toString(),
      name,
      config: JSON.parse(JSON.stringify(config)),
      savedAt: Date.now(),
    }
    const updated = [entry, ...versions].slice(0, MAX_VERSIONS)
    setVersions(updated)
    persistVersions(updated)
    setShowSaveInput(false)
    setSaveName('')
  }

  const exportScreen = async () => {
    const frame = frameRef.current
    if (!frame || exporting) return
    setShowExportMenu(false)
    setExporting(true)
    try {
      const { width, height, filename } = await exportScreenPng(frame, orientation)
      console.info(`[playground] exported ${filename} at ${width}×${height}`)
    } catch (err) {
      // Nothing downloaded, but the playground itself is fine — say so rather
      // than leaving the button spinning with no explanation.
      console.error('[playground] export failed', err)
      alert('Could not export the screen. See the console for details.')
    } finally {
      setExporting(false)
    }
  }

  const finishRecording = async () => {
    const take = recordingRef.current
    recordingRef.current = null
    setRecording(false)
    if (!take) return
    try {
      const { filename, width, height, seconds, sizeBytes } = await take.stop()
      console.info(
        `[playground] recorded ${filename} — ${width}×${height}, ${seconds.toFixed(1)}s, ${(sizeBytes / 1048576).toFixed(1)}MB`
      )
    } catch (err) {
      console.error('[playground] recording failed', err)
      alert('Could not save the recording. See the console for details.')
    }
  }

  const startRecording = async () => {
    const frame = frameRef.current
    if (!frame || recording) return
    setShowExportMenu(false)
    try {
      // Must stay inside the click's user gesture, so no awaits before this.
      const take = await startScreenRecording(frame, orientation)
      recordingRef.current = take
      // Chrome's own "Stop sharing" ends the capture behind our back; treat it
      // as a stop rather than silently dropping what was recorded.
      take.onEndedExternally(() => { void finishRecording() })
      setElapsed(0)
      setRecording(true)
    } catch (err) {
      // Dismissing the picker lands here too, and that's not an error worth
      // interrupting anyone over.
      if ((err as Error)?.name === 'NotAllowedError') return
      if ((err as Error)?.message === 'WRONG_SURFACE') {
        alert('Pick this browser tab in the share dialog — recording a whole screen or another window can\'t be cropped to the checkout.')
        return
      }
      console.error('[playground] could not start recording', err)
      alert('Could not start recording. See the console for details.')
    }
  }

  const restoreVersion = (v: SavedVersion) => {
    setConfig(v.config)
    setPreviewKey(k => k + 1)
    setShowHistory(false)
  }

  const deleteVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = versions.filter(v => v.id !== id)
    setVersions(updated)
    persistVersions(updated)
  }

  const isLandscape = orientation === 'landscape'
  const isDesktop   = orientation === 'desktop'

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

          {/* Export the device frame on its own — still image or video */}
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            {recording ? (
              <button
                onClick={finishRecording}
                title="Stop recording and save the video"
                style={{
                  ...ghostBtn,
                  background: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#dc2626',
                }}
              >
                <Square size={9} fill="currentColor" />
                Stop {formatElapsed(elapsed)}
              </button>
            ) : (
              <button
                onClick={() => setShowExportMenu(o => !o)}
                disabled={exporting}
                title="Export the checkout screen"
                style={{
                  ...ghostBtn,
                  background: showExportMenu ? '#f4f4f5' : '#fff',
                  borderColor: showExportMenu ? '#d4d4d8' : '#e4e4e7',
                  cursor: exporting ? 'default' : 'pointer',
                  color: exporting ? '#a1a1aa' : '#3f3f46',
                }}
                onMouseEnter={e => { if (!exporting && !showExportMenu) (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
                onMouseLeave={e => { if (!showExportMenu) (e.currentTarget as HTMLElement).style.background = '#fff' }}
              >
                {exporting
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Download size={13} />}
                {exporting ? 'Exporting…' : 'Export'}
                {!exporting && <ChevronDown size={12} style={{ opacity: .5, marginLeft: -1 }} />}
              </button>
            )}

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    width: 244,
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  <ExportMenuItem
                    icon={<Image size={14} />}
                    title="Screenshot"
                    detail="PNG at 3× — the screen as it stands"
                    onClick={exportScreen}
                  />
                  <ExportMenuItem
                    icon={<Video size={14} />}
                    title="Record video"
                    detail="Capture an interaction as it plays"
                    onClick={startRecording}
                    divider
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save button / inline name input */}
          <div style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              {showSaveInput ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, width: 40 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 40 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 34, padding: '0 10px',
                    background: '#fff', border: '1px solid #6366f1',
                    borderRadius: 8, boxShadow: '0 0 0 3px rgba(99,102,241,.12)',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    ref={saveInputRef}
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveVersion()
                      if (e.key === 'Escape') { setShowSaveInput(false); setSaveName('') }
                    }}
                    placeholder={`Version ${versions.length + 1}`}
                    style={{
                      fontSize: 13, border: 'none', outline: 'none',
                      width: 130, fontFamily: 'inherit', color: '#18181b',
                      background: 'transparent',
                    }}
                  />
                  <button
                    onClick={saveVersion}
                    style={{
                      height: 22, padding: '0 8px', background: '#6366f1',
                      border: 'none', borderRadius: 5, color: '#fff',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'inherit', flexShrink: 0,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveInput(false); setSaveName('') }}
                    style={{ ...iconBtn, width: 20, height: 20, flexShrink: 0 }}
                  >
                    <X size={11} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => { setSaveName(''); setShowSaveInput(true) }}
                  style={ghostBtn}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
                >
                  <Save size={13} />
                  Save
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* History button + dropdown */}
          <div ref={historyRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowHistory(o => !o)}
              style={{
                ...ghostBtn,
                background: showHistory ? '#f4f4f5' : '#fff',
                borderColor: showHistory ? '#d4d4d8' : '#e4e4e7',
              }}
              onMouseEnter={e => { if (!showHistory) (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
              onMouseLeave={e => { if (!showHistory) (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <Clock size={13} />
              {versions.length > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: '#6366f1', color: '#fff',
                  fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px', marginLeft: 2,
                }}>
                  {versions.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 288,
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {/* Panel header */}
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f4f4f5',
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '.06em', textTransform: 'uppercase', color: '#a1a1aa',
                  }}>
                    Saved Versions
                  </div>

                  {versions.length === 0 ? (
                    <div style={{ padding: '24px 14px', fontSize: 13, color: '#a1a1aa', textAlign: 'center' }}>
                      No saved versions yet
                    </div>
                  ) : (
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {versions.map((v, i) => (
                        <div
                          key={v.id}
                          onClick={() => restoreVersion(v)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px',
                            borderBottom: i < versions.length - 1 ? '1px solid #f4f4f5' : 'none',
                            cursor: 'pointer',
                            transition: 'background .1s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          {/* Version info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 500, color: '#18181b',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {v.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>
                              {relativeTime(v.savedAt)}
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={e => deleteVersion(v.id, e)}
                            title="Delete"
                            style={iconBtn}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = '#fef2f2'
                              ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent'
                              ;(e.currentTarget as HTMLElement).style.color = '#71717a'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset */}
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
          <ConfigPanel config={config} onChange={setConfig} activeTab={configTab} onTabChange={setConfigTab} />
        </div>

        {/* Center canvas */}
        <div
          className="flex-1 overflow-auto scrollbar-hide"
          style={{ borderRadius: 12, background: '#e8e8ea', minWidth: 0, position: 'relative' }}
        >
          {/* `margin: auto` rather than justify/align-center: centering alone would clip the
              overflowing edges of the wider landscape/desktop frames out of scroll reach. */}
          <div style={{ minHeight: '100%', display: 'flex', padding: '40px', width: 'fit-content', minWidth: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${previewKey}-${orientation}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ margin: 'auto' }}
              >
                <CheckoutPreviewWrapper ref={frameRef} key={`${previewKey}-${configTab}`} config={config} orientation={orientation} isMultiOffers={configTab === 'multi-offers'} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right — Assets panel */}
        <div style={{ width: 320, flexShrink: 0, height: '100%' }}>
          <AssetsPanel config={config} onChange={setConfig} mode={configTab} />
        </div>
      </div>
    </div>
  )
}
