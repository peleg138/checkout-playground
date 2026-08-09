import React from 'react'
import { useAppearance } from '../../playground/AppearanceContext'
import { useScrollFade } from '../../hooks/useScrollFade'
import type { MultiOffer } from '../../playground/types'

const MAX_TITLE_CHARS = 22

/**
 * Breaks a long title onto a second line at the last word boundary within
 * MAX_TITLE_CHARS. Titles that already carry an explicit \n keep that break.
 */
function wrapTitle(title: string) {
  if (title.includes('\n') || title.length <= MAX_TITLE_CHARS) return title
  const cut = title.lastIndexOf(' ', MAX_TITLE_CHARS)
  if (cut <= 0) return title
  return `${title.slice(0, cut)}\n${title.slice(cut + 1)}`
}

function OfferRow({ offer, src, hasBg, isLast, compact }: { offer: MultiOffer; src: string | null; hasBg: boolean; isLast: boolean; compact: boolean }) {
  const textPrimary = hasBg ? 'text-white' : 'text-[#09090b]'
  const subColor = hasBg ? 'text-[#E4E4E7]' : 'text-[#8c8c8c]'
  const divColor = hasBg ? 'bg-white/20' : 'bg-[#e4e4e7]'
  const thumb = compact ? 30 : 44
  const titleSize = compact ? 'text-[14px] leading-[16px]' : 'text-[15px] leading-[20px]'
  // Landscape uses smaller item text than portrait, but keeps its lines airy.
  const itemSize = compact ? 'text-[12.5px] leading-[21px]' : 'text-[13px] leading-[20px]'
  return (
    <div>
      <div className={`flex gap-3 pl-2.5 pr-2 ${compact ? 'pt-1.5 pb-0.5' : 'pt-3 pb-3'}`}>
        {/* Landscape trims the thumbnail so more of the list fits its short window. */}
        <div style={{ width: thumb, height: thumb, borderRadius: 6, flexShrink: 0, position: 'relative', marginTop: compact ? 1 : 0 }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 6, outline: `1px solid ${hasBg ? 'rgba(255,255,255,0.20)' : '#C4C4C4'}`, outlineOffset: '-1px' }} draggable={false} />}
          {offer.qty > 0 && (
            <div style={{ position: 'absolute', bottom: -3, right: -3, minWidth: compact ? 23 : 28, height: compact ? 15 : 18, background: '#09090b', borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              <span style={{ fontSize: compact ? 9 : 10, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1 }}>x{offer.qty}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`${titleSize} font-semibold ${textPrimary} flex-1`} style={{ whiteSpace: 'pre-line' }}>{wrapTitle(offer.title)}</span>
            <span className={`${titleSize} font-semibold ${textPrimary} flex-shrink-0`}>{offer.price}</span>
          </div>
          <div className={`flex flex-col ${compact ? 'mt-0' : 'mt-1.5'}`}>
            {offer.items.map((item, j) => (
              <div key={j} className="flex justify-between">
                <span className={`${itemSize} font-normal ${subColor}`}>{item.name}</span>
                <span className={`${itemSize} font-normal ${subColor}`}>{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!isLast && <div className={`h-px mx-2 ${divColor}`} />}
    </div>
  )
}

interface Props {
  hasBg: boolean
  /** Window height for the scroll area — landscape has far less room than portrait. */
  maxHeight?: number
  /** Trims the row's top padding where vertical space is tight (landscape). */
  compact?: boolean
}

/**
 * The scrollable multi-offer list. Portrait nests it inside the collapsible
 * header box; landscape/desktop render it on its own, with no collapse control,
 * so the list itself is the whole affordance.
 */
export function MultiOfferList({ hasBg, maxHeight = 200, compact = false }: Props) {
  const { products, background } = useAppearance()
  const offers = products.multiOffers ?? []
  const fade = useScrollFade([offers, maxHeight])

  return (
    <div
      ref={fade.ref}
      onScroll={fade.onScroll}
      style={{
        maxHeight,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        ...fade.maskStyle,
      } as React.CSSProperties}
    >
      {offers.map((offer, idx, arr) => (
        <OfferRow key={offer.id ?? idx} offer={offer} src={(background.offerImages ?? [])[idx] ?? null} hasBg={hasBg} isLast={idx === arr.length - 1} compact={compact} />
      ))}
    </div>
  )
}
