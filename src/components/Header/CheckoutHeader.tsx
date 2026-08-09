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
import { MultiOfferBox } from './MultiOfferBox'
import { multiOfferPricing } from '../../utils/multiOfferPricing'

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
            <MultiOfferBox expanded={expanded} onToggle={onToggle} hasBg={hasBg} />

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
