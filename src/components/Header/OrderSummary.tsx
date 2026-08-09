import React, { useState } from 'react'
import { Tag } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { mockOrder } from '../../data/mockData'
import promoCircleCheck from '../../assets/icons/promo-circle-check.png'
import promoCircleX from '../../assets/icons/promo-circle-x.png'
import promoDeskSrc1 from '../../assets/icons/promo-desk-1.png'
import banner1Src from '../../assets/icons/banner-1.png'
import { useAppearance } from '../../playground/AppearanceContext'
import { useScrollFade } from '../../hooks/useScrollFade'
import { multiOfferPricing } from '../../utils/multiOfferPricing'

function TagIcon({ stroke, size = 16 }: { stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0" style={{ width: size, height: size }}>
      <path
        d="M2 2.667A.667.667 0 0 1 2.667 2H7.06c.177 0 .346.07.471.195l5.667 5.667a.667.667 0 0 1 0 .943l-4.393 4.39a.667.667 0 0 1-.943 0L2.195 7.529A.667.667 0 0 1 2 7.06V2.667z"
        stroke={stroke ?? '#9ca3af'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="4.667" cy="4.667" r="0.833" fill={stroke ?? '#9ca3af'} />
    </svg>
  )
}

function ErrorXIcon() {
  return <img src={promoCircleX} alt="" width={18} height={18} draggable={false} className="flex-shrink-0" />
}

function SuccessCheckIcon() {
  return <img src={promoCircleCheck} alt="" width={18} height={18} draggable={false} className="flex-shrink-0" />
}

interface OrderSummaryProps {
  promoCode: string
  promoStatus: 'idle' | 'success' | 'error' | 'expired'
  promoDiscount: number
  promoLabel: string
  effectiveTotal: number
  onPromoChange: (val: string) => void
  onPromoApply: () => void
  onPromoClear: () => void
  /** Override the outer container's horizontal padding (default: 'px-4') */
  paddingClass?: string
  /** Desktop layout — use larger text and icon sizes to compensate for 75% scale */
  isDesktop?: boolean
  /** Landscape shares the desktop screen but has a much shorter list window. */
  isLandscape?: boolean
  /** Show promo banner images above pricing rows (desktop + landscape) */
  showPromoImages?: boolean
  isMultiOffers?: boolean
}

export function PromoInput({
  promoCode, promoStatus, primaryColor, placeholder = 'Promo code', transparent = false, onPromoChange, onPromoApply, onPromoClear,
}: {
  promoCode: string
  promoStatus: 'idle' | 'success' | 'error' | 'expired'
  primaryColor: string
  placeholder?: string
  transparent?: boolean
  onPromoChange: (val: string) => void
  onPromoApply: () => void
  onPromoClear: () => void
}) {
  const [focused, setFocused] = React.useState(false)

  let borderStyle: React.CSSProperties = {}
  let borderClass = 'border-[#e5e7eb]'
  if (promoStatus === 'error' || promoStatus === 'expired') {
    borderClass = 'border-red-500'
  } else if (promoStatus === 'success') {
    borderClass = 'border-[#22c55e]'
  } else if (focused) {
    borderStyle = {
      borderColor: primaryColor,
      boxShadow: `0 0 0 2px ${primaryColor}33`,
    }
    borderClass = ''
  }

  return (
    <div
      className={`flex items-center h-10 rounded-[6px] px-3 gap-2 transition-all ${transparent ? 'border-transparent bg-transparent' : `border bg-white ${borderClass}`}`}
      style={transparent ? {} : borderStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <input
        type="text"
        value={promoCode}
        onChange={e => onPromoChange(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && promoCode.trim() && onPromoApply()}
        placeholder={placeholder}
        readOnly={promoStatus === 'success'}
        className={[
          'flex-1 min-w-0 bg-transparent outline-none text-[14px] leading-5 font-normal placeholder:text-[#9ca3af]',
          promoStatus === 'error' || promoStatus === 'expired' ? 'text-red-500' : 'text-[#09090b]',
        ].join(' ')}
      />
      {promoStatus === 'idle' && !promoCode.trim() && !transparent && <TagIcon />}
      {promoStatus === 'idle' && promoCode.trim() && (
        <button
          onClick={onPromoApply}
          className="text-[14px] leading-5 font-medium whitespace-nowrap flex-shrink-0"
          style={{ color: primaryColor }}
        >
          Apply
        </button>
      )}
      {(promoStatus === 'error' || promoStatus === 'expired') && (
        <button onClick={onPromoClear} className="flex-shrink-0" aria-label="Clear">
          <ErrorXIcon />
        </button>
      )}
      {promoStatus === 'success' && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onPromoClear} className="text-[12px] leading-4 font-normal text-[#6b7280] bg-[#f3f4f6] rounded-full px-2 py-0.5 whitespace-nowrap">
            Remove
          </button>
          <SuccessCheckIcon />
        </div>
      )}
    </div>
  )
}

export function OrderSummary({
  promoCode,
  promoStatus,
  promoDiscount,
  promoLabel,
  effectiveTotal,
  onPromoChange,
  onPromoApply,
  onPromoClear,
  paddingClass = 'px-4',
  isDesktop = false,
  isLandscape = false,
  showPromoImages = false,
  isMultiOffers = false,
}: OrderSummaryProps) {
  const [promoOpen, setPromoOpen] = useState(false)
  const { background, products, promo, showProductImages, appearance } = useAppearance()
  const showCoupon = appearance.showCoupon ?? true
  const hasBg = !!background.imageUrl && background.backgroundType !== 'white'

  // Use configurable products if provided, otherwise fall back to mockOrder
  const items = products.items.length > 0 ? products.items : mockOrder.items
  const pricing = {
    currency: products.currency || mockOrder.pricing.currency,
    subtotal: products.subtotal ?? mockOrder.pricing.subtotal,
    tax: products.tax ?? mockOrder.pricing.tax,
  }
  // Multi-offer summary is driven by the offer prices, not the single-offer subtotal.
  const multiPricing = multiOfferPricing(products.multiOffers, pricing.tax, promoDiscount)
  const displaySubtotal = isMultiOffers ? multiPricing.subtotal : pricing.subtotal
  const displayTax = isMultiOffers ? multiPricing.taxAmount : 0
  const displayTotal = isMultiOffers ? multiPricing.total : effectiveTotal

  const textPrimary = hasBg ? 'text-white' : 'text-[#09090b]'
  // Pricing rows read at full white over a background image — 80% was muddy against the art.
  const textSecondary = hasBg ? 'text-white' : 'text-black'
  const dividerColor = hasBg ? 'border-white/20' : 'border-[#e4e4e7]'
  // Shorter than the default: rows here are 51px tall, so a long fade washes out a whole item.
  // Tuned per layout — a fade that reads well in desktop's 154px window covers too much of a
  // row in landscape's 79px one, and portrait sits between the two.
  const itemsFadePx = isDesktop ? 10 : isLandscape ? 5 : 6
  const itemsFade = useScrollFade([items, isDesktop, isLandscape, showPromoImages], itemsFadePx)

  // Landscape sits tight under the offer panel; portrait keeps the roomier pt-3.
  return (
    <div className={`flex flex-col gap-4 pb-0 ${paddingClass} ${isMultiOffers ? (isLandscape ? 'pt-1' : 'pt-3') : ''}`}>
      {/* Items */}
      {/* Panel tint lives on the wrapper so the fade masks only the rows, not the panel edge */}
      {!isMultiOffers && <div className={`${hasBg ? 'bg-black/10' : 'bg-[#f4f4f5]'} rounded-[7px]`}><div
        ref={itemsFade.ref}
        onScroll={itemsFade.onScroll}
        className="overflow-y-auto"
        style={{ maxHeight: isDesktop ? 154 : showPromoImages ? 79 : 128, ...itemsFade.maskStyle }}
      >
        {/* Portrait is the only layout with tightened rows; landscape/desktop keep 51/58. */}
        {items.map((item) => (
          <div key={item.id} className={`flex items-center justify-between px-3 ${isDesktop ? 'h-[58px] min-h-[58px]' : isLandscape ? 'h-[51px] min-h-[51px]' : 'h-[50px] min-h-[50px]'}`}>
            <div className="flex items-center gap-3">
              {showProductImages && item.icon && (
                <img src={item.icon} alt={item.name} className={`${isDesktop ? 'w-[38px] h-[38px]' : 'w-[33px] h-[33px]'} flex-shrink-0 object-contain`} draggable={false} />
              )}
              <span className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textPrimary}`}>{item.name}</span>
            </div>
            <span className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textPrimary}`}>{item.quantity}</span>
          </div>
        ))}
      </div></div>}



      {/* Promo images — desktop + landscape only */}
      {showPromoImages && showCoupon && (
        <AnimatePresence initial={false}>
          {!promoOpen && (
            <motion.div
              key="promo-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="py-1"
            >
              <button
                onClick={() => setPromoOpen(true)}
                className="flex items-center gap-2"
                style={{ padding: '4px 0', background: 'transparent', border: 'none' }}
              >
                <Tag size={15} strokeWidth={1.8} color={hasBg ? 'white' : '#09090b'} className="flex-shrink-0" />
                <span className={`${isDesktop ? 'text-[15.5px]' : 'text-[14.5px]'} leading-5 font-medium underline underline-offset-4`} style={{ color: hasBg ? 'white' : appearance.primaryColor }}>Add Promo Code</span>
              </button>
            </motion.div>
          )}
          {promoOpen && (
            <motion.div
              key="promo-expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className={`flex flex-col gap-2 ${!isDesktop ? 'pt-2 pb-1' : 'py-2'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] leading-[18px] font-medium ${hasBg ? 'text-white' : 'text-[#09090b]'}`}>Add Promo Code</span>
                  <button
                    onClick={() => { setPromoOpen(false); onPromoClear() }}
                    className={`text-[13px] leading-[18px] font-medium ${hasBg ? 'text-[#E4E4E7]' : 'text-[#71717A]'}`}
                  >
                    Cancel
                  </button>
                </div>
                <PromoInput
                  promoCode={promoCode}
                  promoStatus={promoStatus}
                  primaryColor={appearance.primaryColor}
                  placeholder="Coupon"
                  onPromoChange={onPromoChange}
                  onPromoApply={onPromoApply}
                  onPromoClear={onPromoClear}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Pricing rows */}
      <div className={`flex flex-col ${showPromoImages && !isDesktop ? 'gap-0.5' : 'gap-2'}`}>
        <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
          <span>Subtotal</span>
          <span>{pricing.currency}{displaySubtotal.toFixed(2)}</span>
        </div>
        {promoStatus === 'success' && promoDiscount > 0 && (
          <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
            <span>Promocode</span>
            <span>-{pricing.currency}{promoDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
          <span>Tax ({pricing.tax}%)</span>
          <span>{pricing.currency}{displayTax.toFixed(2)}</span>
        </div>
        <div className={`${isDesktop ? 'text-[18px] leading-7' : 'text-[16px] leading-6'} font-bold ${textSecondary} flex justify-between h-8 items-start -mx-4 px-4`}>
          <span>Total</span>
          <span>{pricing.currency}{displayTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
