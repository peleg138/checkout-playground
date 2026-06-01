import React from 'react'
import { mockOrder } from '../../data/mockData'
import promoCircleCheck from '../../assets/icons/promo-circle-check.png'
import promoCircleX from '../../assets/icons/promo-circle-x.png'
import { useAppearance } from '../../playground/AppearanceContext'

function TagIcon({ stroke }: { stroke?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0">
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
}

export function PromoInput({
  promoCode, promoStatus, primaryColor, onPromoChange, onPromoApply, onPromoClear,
}: {
  promoCode: string
  promoStatus: 'idle' | 'success' | 'error' | 'expired'
  primaryColor: string
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
      className={`flex items-center h-10 rounded-[6px] border bg-white px-3 gap-2 transition-all ${borderClass}`}
      style={borderStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <input
        type="text"
        value={promoCode}
        onChange={e => onPromoChange(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && promoCode.trim() && onPromoApply()}
        placeholder="Promo code"
        readOnly={promoStatus === 'success'}
        className={[
          'flex-1 min-w-0 bg-transparent outline-none text-[14px] leading-5 font-normal placeholder:text-[#9ca3af]',
          promoStatus === 'error' || promoStatus === 'expired' ? 'text-red-500' : 'text-[#09090b]',
        ].join(' ')}
      />
      {promoStatus === 'idle' && !promoCode.trim() && <TagIcon />}
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
}: OrderSummaryProps) {
  const { background, products, promo, showProductImages, appearance } = useAppearance()
  const hasBg = !!background.imageUrl && background.backgroundType !== 'white'

  // Use configurable products if provided, otherwise fall back to mockOrder
  const items = products.items.length > 0 ? products.items : mockOrder.items
  const pricing = {
    currency: products.currency || mockOrder.pricing.currency,
    subtotal: products.subtotal ?? mockOrder.pricing.subtotal,
    tax: products.tax ?? mockOrder.pricing.tax,
  }

  const textPrimary = hasBg ? 'text-white' : 'text-[#09090b]'
  const textSecondary = hasBg ? 'text-white/80' : 'text-black'
  const dividerColor = hasBg ? 'border-white/20' : 'border-[#e4e4e7]'

  return (
    <div className={`flex flex-col gap-4 pb-0 ${paddingClass}`}>
      {/* Items */}
      <div
        className={`overflow-y-auto ${hasBg ? 'bg-black/10 rounded-[7px]' : 'bg-[#f4f4f5] rounded-[7px]'}`}
        style={{ maxHeight: isDesktop ? 154 : 128 }}
      >
        {items.map((item) => (
          <div key={item.id} className={`flex items-center justify-between px-3 ${isDesktop ? 'h-[58px] min-h-[58px]' : 'h-[51px] min-h-[51px]'}`}>
            <div className="flex items-center gap-3">
              {showProductImages && item.icon && (
                <img src={item.icon} alt={item.name} className={`${isDesktop ? 'w-[38px] h-[38px]' : 'w-[33px] h-[33px]'} flex-shrink-0 object-contain`} draggable={false} />
              )}
              <span className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textPrimary}`}>{item.name}</span>
            </div>
            <span className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textPrimary}`}>{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Promo code input — only if enabled */}
      {promo.enabled && (
        <PromoInput
          promoCode={promoCode}
          promoStatus={promoStatus}
          primaryColor={appearance.primaryColor}
          onPromoChange={onPromoChange}
          onPromoApply={onPromoApply}
          onPromoClear={onPromoClear}
        />
      )}

      {/* Pricing rows */}
      <div className="flex flex-col gap-1">
        <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
          <span>Subtotal</span>
          <span>{pricing.currency}{pricing.subtotal.toFixed(2)}</span>
        </div>
        {promoStatus === 'success' && promoDiscount > 0 && (
          <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
            <span>Promocode</span>
            <span>-{pricing.currency}{promoDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-normal ${textSecondary} flex justify-between`}>
          <span>Tax ({pricing.tax}%)</span>
          <span>{pricing.currency}0.00</span>
        </div>
        <div className={`${isDesktop ? 'text-[18px] leading-7' : 'text-[16px] leading-6'} font-bold ${textSecondary} flex justify-between h-8 items-start -mx-4 px-4`}>
          <span>Total</span>
          <span>{pricing.currency}{effectiveTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
