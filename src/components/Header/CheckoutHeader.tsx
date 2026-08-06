import React from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { mockOrder } from '../../data/mockData'
import { OrderSummary } from './OrderSummary'
import logoSrc from '../../assets/icons/logo.png'
import shoppingCartSrc from '../../assets/icons/ShoppingCart.png'
import containerSrc from '../../assets/icons/Container.png'
import genericHeaderSrc from '../../assets/icons/GenericHeader.png'
import { useAppearance } from '../../playground/AppearanceContext'
import { useScrollFade } from '../../hooks/useScrollFade'
import { multiOfferPricing } from '../../utils/multiOfferPricing'
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

function OfferRow({ offer, src, hasBg, isLast }: { offer: MultiOffer; src: string | null; hasBg: boolean; isLast: boolean }) {
  const textPrimary = hasBg ? 'text-white' : 'text-[#09090b]'
  const subColor = hasBg ? 'text-[#E4E4E7]' : 'text-[#8c8c8c]'
  const divColor = hasBg ? 'bg-white/20' : 'bg-[#e4e4e7]'
  return (
    <div>
      <div className="flex gap-3 pl-2.5 pr-2 py-3">
        <div style={{ width: 44, height: 44, borderRadius: 6, flexShrink: 0, position: 'relative' }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 6, outline: `1px solid ${hasBg ? 'rgba(255,255,255,0.20)' : '#C4C4C4'}`, outlineOffset: '-1px' }} draggable={false} />}
          {offer.qty > 0 && (
            <div style={{ position: 'absolute', bottom: -3, right: -3, minWidth: 28, height: 18, background: '#09090b', borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1 }}>x{offer.qty}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[15px] leading-[20px] font-semibold ${textPrimary} flex-1`} style={{ whiteSpace: 'pre-line' }}>{wrapTitle(offer.title)}</span>
            <span className={`text-[15px] leading-[20px] font-semibold ${textPrimary} flex-shrink-0`}>{offer.price}</span>
          </div>
          <div className="flex flex-col mt-1.5">
            {offer.items.map((item, j) => (
              <div key={j} className="flex justify-between">
                <span className={`text-[13px] leading-[20px] font-normal ${subColor}`}>{item.name}</span>
                <span className={`text-[13px] leading-[20px] font-normal ${subColor}`}>{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!isLast && <div className={`h-px mx-2 ${divColor}`} />}
    </div>
  )
}

interface CheckoutHeaderProps {
  expanded: boolean
  onToggle: () => void
  onClose: () => void
  effectiveTotal: number
  promoCode: string
  promoStatus: 'idle' | 'success' | 'error' | 'expired'
  promoDiscount: number
  promoLabel: string
  onPromoChange: (val: string) => void
  onPromoApply: () => void
  onPromoClear: () => void
  isMultiOffers?: boolean
}

export function CheckoutHeader({
  expanded,
  onToggle,
  onClose,
  effectiveTotal,
  promoCode,
  promoStatus,
  promoDiscount,
  promoLabel,
  onPromoChange,
  onPromoApply,
  onPromoClear,
  isMultiOffers = false,
}: CheckoutHeaderProps) {
  const { offer, pricing: mockPricing } = mockOrder
  const { products, background, appearance } = useAppearance()
  const pricing = {
    currency: products.currency || mockPricing.currency,
    subtotal: products.subtotal ?? mockPricing.subtotal,
    tax: products.tax ?? mockPricing.tax,
  }
  // Multi-offer summary is driven by the offer prices, not the single-offer subtotal.
  const multiPricing = multiOfferPricing(products.multiOffers, pricing.tax, promoDiscount)
  const offerCount = products.offerCount ?? 3
  const extraOffers = offerCount > 3 ? offerCount - 3 : 0
  const offerTitle = products.offerTitle || offer.title
  const gameLogo = products.gameLogo || logoSrc
  const hasBg = !!background.imageUrl && background.backgroundType !== 'white'

  const offerListFade = useScrollFade([expanded, products.multiOffers])

  // Icon/text colors adapt to background
  const iconColor = hasBg ? 'white' : '#09090b'
  const titleColor = hasBg ? 'text-white' : 'text-black'

  return (
    <div className="relative px-4 overflow-hidden">
      {/* Background image layer (full header) */}
      {hasBg && (
        <>
          {/* Fixed height so background-size: cover never recalculates as header resizes */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: 812,
              backgroundImage: `url(${background.imageUrl})`,
              backgroundSize: background.fit,
              backgroundPosition: background.position,
              opacity: background.opacity / 100,
              filter: background.blur > 0 ? `blur(${background.blur}px)` : undefined,
            }}
          />
          {background.overlay > 0 && (
            <div className="absolute inset-x-0 top-0" style={{ height: 812, background: 'black', opacity: background.overlay / 100 }} />
          )}
        </>
      )}
      {!hasBg && <div className="absolute inset-0 bg-white" />}

      {/* Content layer */}
      <div className="relative">
        {/* Row 1: logo + close */}
        <div className="flex items-center gap-2 pt-3 pb-4">
          <img src={gameLogo} alt={products.gameName || 'Game'} className="w-11 h-11 rounded-[4.4px] flex-shrink-0 object-cover" draggable={false} />
          <span className="flex-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            aria-label="Close"
            style={{ color: iconColor }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Row 2 (multi offers): stacked offer thumbnails + count + chevron */}
        {isMultiOffers && (
          <>
            {/* Gray box: button + offer cards */}
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
                  <span className={`block text-[14px] leading-5 font-semibold ${titleColor}`}>{offerCount} Offers</span>
                  {!expanded && <span className={`block text-[12px] leading-4 font-normal ${hasBg ? 'text-white/70' : 'text-[#71717a]'}`}>Tap to view details</span>}
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
                    <div
                      ref={offerListFade.ref}
                      onScroll={offerListFade.onScroll}
                      style={{
                        maxHeight: 200,
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        ...offerListFade.maskStyle,
                      } as React.CSSProperties}
                    >
                      {(products.multiOffers ?? []).map((offer, idx, arr) => (
                        <OfferRow key={offer.id ?? idx} offer={offer} src={(background.offerImages ?? [])[idx] ?? null} hasBg={hasBg} isLast={idx === arr.length - 1} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing section — outside gray box */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="multi-pricing"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                  className="-mx-4"
                >
                  <OrderSummary
                    promoCode={promoCode}
                    promoStatus={promoStatus}
                    promoDiscount={promoDiscount}
                    promoLabel={promoLabel}
                    effectiveTotal={effectiveTotal}
                    onPromoChange={onPromoChange}
                    onPromoApply={onPromoApply}
                    onPromoClear={onPromoClear}
                    isMultiOffers={isMultiOffers}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Row 2: offer title + details button (single offer only) */}
        {!isMultiOffers && (
          <div className="flex items-center justify-between pb-3">
            <span className={`text-[16px] leading-6 font-bold ${titleColor} truncate min-w-0 max-w-[50%]`}>{offerTitle}</span>
            <button
              onClick={onToggle}
              className="flex items-center gap-0.5 py-2 pl-2"
              aria-label="Toggle details"
              style={{ color: iconColor }}
            >
              <img src={shoppingCartSrc} alt="" width={16} height={16} draggable={false} className="flex-shrink-0 mr-1" style={{ filter: hasBg ? 'brightness(0) invert(1)' : 'none' }} />
              <span className={`text-[14px] leading-5 font-medium min-w-[41px] w-[41px] text-center ${titleColor}`}>
                Details
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 ml-1" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                <path d="M5 7.5l5 5 5-5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Pricing rows — visible only when collapsed */}
        {!expanded && (
          <div className="flex flex-col gap-2 pb-3">
            {isMultiOffers && (
              <>
                <div className="flex justify-between">
                  <span className={`text-[14px] leading-5 font-normal ${titleColor}`}>Subtotal</span>
                  <span className={`text-[14px] leading-5 font-normal ${titleColor}`}>{pricing.currency}{multiPricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[14px] leading-5 font-normal ${titleColor}`}>Tax ({pricing.tax}%)</span>
                  <span className={`text-[14px] leading-5 font-normal ${titleColor}`}>{pricing.currency}{multiPricing.taxAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between">
              <span className={`text-[16px] leading-6 font-bold ${titleColor}`}>Total</span>
              <span className={`text-[17px] leading-6 font-bold ${titleColor}`}>{pricing.currency}{(isMultiOffers ? multiPricing.total : effectiveTotal).toFixed(2)}</span>
            </div>
          </div>
        )}
        {!expanded && (
          <div className={`h-px -mx-4 ${hasBg ? 'bg-white/20' : 'bg-[#e5e7eb]'}`} />
        )}

        {/* Expanded order summary (single offer only) */}
        {!isMultiOffers && (
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="order-summary"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
                className="-mx-4"
              >
                <OrderSummary
                  promoCode={promoCode}
                  promoStatus={promoStatus}
                  promoDiscount={promoDiscount}
                  promoLabel={promoLabel}
                  effectiveTotal={effectiveTotal}
                  onPromoChange={onPromoChange}
                  onPromoApply={onPromoApply}
                  onPromoClear={onPromoClear}
                  isMultiOffers={isMultiOffers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
