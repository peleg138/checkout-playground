import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppearance } from '../../playground/AppearanceContext'
import { MultiOfferList } from './MultiOfferList'
import shoppingCartSrc from '../../assets/icons/ShoppingCart.png'

interface Props {
  expanded: boolean
  onToggle: () => void
  hasBg: boolean
  /** Window height for the expanded list. */
  maxHeight?: number
  /** Desktop reads at a larger size, so the summary labels scale up a touch. */
  isDesktop?: boolean
}

/**
 * The collapsible multi-offer box: a summary button that expands into the offer
 * list. Shared by the portrait header and the desktop order summary so both read
 * identically; landscape skips it and shows the bare list, having no room to collapse.
 */
export function MultiOfferBox({ expanded, onToggle, hasBg, maxHeight, isDesktop = false }: Props) {
  const { products, background } = useAppearance()
  const offerCount = products.offerCount ?? 3
  const extraOffers = offerCount > 3 ? offerCount - 3 : 0
  const iconColor = hasBg ? 'white' : '#09090b'
  const titleColor = hasBg ? 'text-white' : 'text-black'

  return (
    <div style={{ background: expanded ? (hasBg ? 'rgba(0,0,0,0.10)' : '#f4f4f5') : 'transparent', borderRadius: 8, marginBottom: expanded ? 0 : 12 }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5"
        style={{ background: expanded ? 'transparent' : (hasBg ? 'rgba(0,0,0,0.10)' : '#f4f4f5'), borderRadius: 8, padding: '9px 10px', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        {expanded ? (
          <div style={{ width: 44, height: 44, borderRadius: 6, background: hasBg ? 'rgba(255,255,255,0.15)' : '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, outline: `1px solid ${hasBg ? 'rgba(255,255,255,0.20)' : '#C4C4C4'}`, outlineOffset: '-1px' }}>
            <img src={shoppingCartSrc} alt="" width={17} height={17} draggable={false} style={{ filter: hasBg ? 'brightness(0) invert(1)' : 'none' }} />
          </div>
        ) : (
          <div style={{ position: 'relative', width: 80, height: 44, flexShrink: 0 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                position: 'absolute', left: i * 14, top: 0, width: 44, height: 44,
                borderRadius: 5, overflow: 'hidden', border: `1px solid ${hasBg ? '#fff' : '#09090b'}`,
                background: '#d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', clipPath: 'inset(0 round 5px)',
              }}>
                {(() => { const src = background.offerImages?.[2 - i] ?? null; return src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} draggable={false} /> : null })()}
              </div>
            ))}
            {extraOffers > 0 && (
              <div style={{
                position: 'absolute', left: 72, top: '50%', transform: 'translate(-50%, -50%)',
                background: '#09090b', borderRadius: 100,
                padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10,
              }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px', lineHeight: 1 }}>+{extraOffers}</span>
              </div>
            )}
          </div>
        )}
        {/* Collapsed: the "+N" chip overhangs the thumbnail stack, so pad extra to clear it */}
        <div className={`flex-1 min-w-0 ${expanded || extraOffers > 0 ? 'pl-2' : 'pl-0'}`}>
          <span className={`block ${isDesktop ? 'text-[15px] leading-[21px]' : 'text-[14px] leading-5'} font-semibold ${titleColor}`}>{offerCount} Offers</span>
          {!expanded && <span className={`block ${isDesktop ? 'text-[13px] leading-[18px]' : 'text-[12px] leading-4'} font-normal ${hasBg ? 'text-white/70' : 'text-[#71717a]'}`}>Tap to view details</span>}
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          <path d="M5 7.5l5 5 5-5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="offer-cards"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={`h-px ${hasBg ? 'bg-white/20' : 'bg-[#e4e4e7]'}`} />
            <MultiOfferList hasBg={hasBg} maxHeight={maxHeight} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
