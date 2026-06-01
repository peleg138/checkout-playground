import React from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { mockOrder } from '../../data/mockData'
import { OrderSummary } from './OrderSummary'
import logoSrc from '../../assets/icons/logo.png'
import { useAppearance } from '../../playground/AppearanceContext'

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
}: CheckoutHeaderProps) {
  const { offer, pricing } = mockOrder
  const { products, background } = useAppearance()
  const offerTitle = products.offerTitle || offer.title
  const gameLogo = products.gameLogo || logoSrc
  const hasBg = !!background.imageUrl && background.backgroundType !== 'white'

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
        {/* Close row */}
        <div className="h-11 py-[5px] flex items-start justify-between">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            aria-label="Close"
            style={{ color: iconColor }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Topbar row: logo + title + details button */}
        <div className="flex items-center gap-2 pb-3">
          <img src={gameLogo} alt={products.gameName || 'Game'} className="w-11 h-11 rounded-[4.4px] flex-shrink-0 object-cover" draggable={false} />

          <div className="flex items-center gap-2 flex-1">
            <span className={`text-[14px] leading-6 font-semibold ${titleColor}`}>{offerTitle}</span>
          </div>

          <button
            onClick={onToggle}
            className="flex items-center gap-0.5 py-2"
            aria-label="Toggle details"
            style={{ color: iconColor }}
          >
            {/* Tag icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <path d="M3 3.833A.833.833 0 0 1 3.833 3H8.82c.221 0 .433.088.589.244l7.084 7.083a.833.833 0 0 1 0 1.179l-5.49 5.487a.833.833 0 0 1-1.178 0L2.743 9.91A.833.833 0 0 1 2.5 9.32V3.833z" stroke={iconColor} strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="5.833" cy="5.833" r="1.042" fill={iconColor}/>
            </svg>
            <span className={`text-[12px] leading-4 font-semibold min-w-[41px] w-[41px] text-center ${titleColor}`}>
              Details
            </span>
            {/* Chevron icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <path d="M5 7.5l5 5 5-5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Total row — visible only when collapsed */}
        {!expanded && (
          <div className="flex items-baseline justify-between pb-3">
            <span className={`text-[16px] leading-6 font-bold ${titleColor}`}>Total</span>
            <span className={`text-[17px] leading-6 font-bold ${titleColor}`}>{pricing.currency}{effectiveTotal.toFixed(2)}</span>
          </div>
        )}
        {!expanded && (
          <div className={`h-px -mx-4 ${hasBg ? 'bg-white/20' : 'bg-[#e5e7eb]'}`} />
        )}

        {/* Expanded order summary */}
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
