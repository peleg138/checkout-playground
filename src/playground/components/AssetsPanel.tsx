import React, { useRef, useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { PlaygroundConfig } from '../types'

interface Props {
  config: PlaygroundConfig
  onChange: (c: PlaygroundConfig) => void
  mode?: 'config' | 'multi-offers'
}

/* ─── Shared styles ─────────────────────────────────────────── */
const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: '#71717a',
  marginBottom: 8,
}

/* ─── Thumbnail (filled state) ─────────────────────────────── */
interface ThumbnailProps {
  value: string
  onClear: () => void
  onReplace: () => void
  objectFit?: 'contain' | 'cover'
}

function ThumbnailWrap({ value, onClear, onReplace, objectFit = 'contain' }: ThumbnailProps) {
  const [hovered, setHovered] = useState(false)
  const filename = value.startsWith('blob:')
    ? 'uploaded-file'
    : value.split('/').pop()?.split('?')[0] ?? 'image'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onReplace}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: 134,
        height: 58,
        borderRadius: 7,
        overflow: 'hidden',
        background: '#f3f4f6',
        border: '1px solid #e4e4e7',
        cursor: 'pointer',
      }}
    >
      <img
        src={value}
        alt={filename}
        style={{ width: '100%', height: '100%', objectFit, display: 'block' }}
        draggable={false}
      />
      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: hovered ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '4px 5px',
          transition: 'background .15s',
        }}
      >
        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); onClear() }}
          style={{
            position: 'absolute', top: 4, right: 4,
            width: 20, height: 20,
            background: 'rgba(0,0,0,0.45)', border: 'none',
            borderRadius: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
            opacity: hovered ? 1 : 0,
            transition: 'opacity .15s',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          <X size={10} color="#fff" />
        </button>
        {/* Filename */}
        <span
          style={{
            fontSize: 11, fontWeight: 500, color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: '100%', lineHeight: 1.3,
            opacity: hovered ? 1 : 0,
            transition: 'opacity .15s',
            pointerEvents: 'none',
          }}
        >
          {filename}
        </span>
      </div>
    </div>
  )
}

/* ─── Upload Row ─────────────────────────────────────────────── */
interface UploadRowProps {
  label: string
  value: string | null
  onUpload: (url: string) => void
  onClear: () => void
  objectFit?: 'contain' | 'cover'
}

function UploadRow({ label, value, onUpload, onClear, objectFit = 'contain' }: UploadRowProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [hovered, setHovered] = useState(false)
  const hasImage = !!value

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) onUpload(ev.target.result as string) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        border: `1px ${hovered ? 'dashed' : 'solid'} ${hovered ? 'rgba(113,113,122,0.4)' : '#e4e4e7'}`,
        borderRadius: 12,
        padding: '0 18px 0 22px',
        width: '100%',
        gap: 12,
        height: 80,
        boxSizing: 'border-box',
        transition: 'border-color .15s',
      }}
    >
      {/* Label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#374151', fontSize: 13.5, fontWeight: 450,
        flex: 1, minWidth: 0, userSelect: 'none',
      }}>
        {label}
      </div>

      {/* Right: thumbnail (filled) or Add Media button (empty) */}
      {hasImage ? (
        <ThumbnailWrap
          value={value!}
          onClear={onClear}
          onReplace={() => ref.current?.click()}
          objectFit={objectFit}
        />
      ) : (
        <button
          onClick={() => ref.current?.click()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: 6,
            width: 128, height: 40,
            fontSize: 14, fontWeight: 500, color: '#18181b',
            cursor: 'pointer', whiteSpace: 'nowrap',
            flexShrink: 0, fontFamily: 'inherit',
            transition: 'box-shadow .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 3px 8px rgba(79,70,229,0.14)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
        >
          <Plus size={12} />
          Add Media
        </button>
      )}

      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

/* ─── Panel ──────────────────────────────────────────────────── */
export function AssetsPanel({ config, onChange, mode = 'config' }: Props) {
  const isMultiOffers = mode === 'multi-offers'
  const updateBg = (imageUrl: string | null) =>
    onChange({ ...config, background: { ...config.background, imageUrl } })

  const updateLogo = (gameLogo: string) =>
    onChange({ ...config, products: { ...config.products, gameLogo } })

  const updateItemIcon = (idx: number, icon: string) => {
    const items = config.products.items.map((item, i) =>
      i === idx ? { ...item, icon } : item
    )
    onChange({ ...config, products: { ...config.products, items } })
  }

  const clearItemIcon = (idx: number) => updateItemIcon(idx, '')

  return (
    <div
      style={{
        width: 320,
        height: '100%',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div style={{
        height: 'auto',
        padding: '22px 14px 16px 16px',
        borderBottom: '1px solid #f0f0f5',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.07em',
          textTransform: 'uppercase',
          color: '#71717a',
        }}>
          Assets
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Brand ── */}
        <section>
          <p style={sectionLabel}>Brand</p>
          <UploadRow
            label="Game Logo"
            value={config.products.gameLogo || null}
            onUpload={updateLogo}
            onClear={() => updateLogo('')}
          />
        </section>

        {/* ── Background ── */}
        <section>
          <p style={sectionLabel}>Background</p>
          {isMultiOffers ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <UploadRow
                label="Background Image"
                value={config.background.imageUrl}
                onUpload={url => updateBg(url)}
                onClear={() => updateBg(null)}
                objectFit="cover"
              />
              <p style={{ ...sectionLabel, marginTop: 20, marginBottom: 2 }}>Offer Images</p>
              {([0, 1, 2] as const).map((i) => {
                const offerImages = config.background.offerImages ?? [null, null, null]
                return (
                  <UploadRow
                    key={i}
                    label={`Offer ${i + 1}`}
                    value={offerImages[i]}
                    onUpload={url => {
                      const next: [string | null, string | null, string | null] = [...offerImages] as [string | null, string | null, string | null]
                      next[i] = url
                      onChange({ ...config, background: { ...config.background, offerImages: next } })
                    }}
                    onClear={() => {
                      const next: [string | null, string | null, string | null] = [...offerImages] as [string | null, string | null, string | null]
                      next[i] = null
                      onChange({ ...config, background: { ...config.background, offerImages: next } })
                    }}
                    objectFit="cover"
                  />
                )
              })}
            </div>
          ) : (
            <UploadRow
              label="Background Image"
              value={config.background.imageUrl}
              onUpload={url => updateBg(url)}
              onClear={() => updateBg(null)}
              objectFit="cover"
            />
          )}
        </section>

        {/* ── Item Icons (single offer only) ── */}
        {!isMultiOffers && (
          <section>
            <p style={sectionLabel}>Item Icons</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {config.products.items.map((item, idx) => (
                <UploadRow
                  key={item.id}
                  label={item.name}
                  value={item.icon || null}
                  onUpload={url => updateItemIcon(idx, url)}
                  onClear={() => clearItemIcon(idx)}
                />
              ))}
              {config.products.items.length === 0 && (
                <span style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', padding: '12px 0' }}>
                  Add items in the Products section
                </span>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
