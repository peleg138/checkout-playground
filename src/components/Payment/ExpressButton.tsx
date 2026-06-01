import React from 'react'
import applePaySrc from '../../assets/icons/express.png'
import googlePaySrc from '../../assets/icons/express-gpay.png'
import paypalSrc from '../../assets/icons/express-paypal.png'

type ExpressType = 'apple' | 'google' | 'paypal'

const EXPRESS_ASSETS: Record<ExpressType, { src: string; label: string; bg: string }> = {
  apple:  { src: applePaySrc,  label: 'Pay with Apple Pay',  bg: '#000000' },
  google: { src: googlePaySrc, label: 'Pay with Google Pay', bg: '#000000' },
  paypal: { src: paypalSrc,    label: 'Pay with PayPal',     bg: '#FFC439' },
}

interface ExpressButtonProps {
  onClick: () => void
  type?: ExpressType
  /** Compact mode for landscape layout — fixed 54px height, tighter padding */
  compact?: boolean
}

export function ApplePayButton({ onClick, type = 'apple', compact = false }: ExpressButtonProps) {
  const { src, label, bg } = EXPRESS_ASSETS[type]

  if (compact) {
    return (
      <div className="flex flex-col px-4 pt-3 pb-2 gap-2">
        <button
          onClick={onClick}
          className="w-full"
          aria-label={label}
          style={{ height: 44, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
        >
          <div style={{ width: '100%', height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: bg }}>
            <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} draggable={false} />
          </div>
        </button>
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="flex-1 h-0 border-t border-[#e4e4e7]" />
          <span className="text-[14px] leading-none font-normal text-[#71717a] whitespace-nowrap">
            Or pay another way
          </span>
          <div className="flex-1 h-0 border-t border-[#e4e4e7]" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
      <button
        onClick={onClick}
        className="w-full"
        aria-label={label}
        style={{ height: 44, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
      >
        <div style={{ width: '100%', height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: bg }}>
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} draggable={false} />
        </div>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-0 border-t border-[#e4e4e7]" />
        <span className="text-[14px] leading-5 font-normal text-[#71717a] whitespace-nowrap">
          Or pay another way
        </span>
        <div className="flex-1 h-0 border-t border-[#e4e4e7]" />
      </div>
    </div>
  )
}

export function ExpressButton({ onClick, type = 'apple', compact }: ExpressButtonProps) {
  return <ApplePayButton onClick={onClick} type={type} compact={compact} />
}
