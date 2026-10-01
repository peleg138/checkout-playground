import React from 'react'
import gpaySrc from '../../assets/icons/apms-gpay.svg'
import applePayButtonSrc from '../../assets/icons/express.png'
import googlePayButtonSrc from '../../assets/icons/express-gpay.png'

/** How the second charge is taken. */
export type UpsellPayMethod = 'card' | 'applePay' | 'googlePay'

export const WALLET_LABEL: Record<UpsellPayMethod, string> = {
  card: 'Card',
  applePay: 'Apple Pay',
  googlePay: 'Google Pay',
}

/**
 * Apple's mark has no asset in this project — the only Apple Pay artwork here
 * is the full-width express button — so the lockup is drawn inline at the size
 * a caption needs.
 */
function ApplePayMark() {
  return (
    <svg viewBox="3 3 37 15" width="100%" height="100%" aria-hidden="true">
      <g fill="#000000">
        <path d="M10.3 6.03c-.4.47-1.03.84-1.67.79-.08-.63.23-1.3.6-1.72.4-.48 1.1-.83 1.66-.85.07.66-.19 1.3-.59 1.78zm.58.92c-.92-.05-1.7.52-2.14.52-.44 0-1.11-.49-1.84-.48-.95.01-1.83.55-2.31 1.4-.99 1.7-.26 4.23.7 5.62.47.69 1.03 1.45 1.77 1.42.7-.03.98-.45 1.83-.45.85 0 1.1.45 1.84.44.77-.01 1.25-.69 1.72-1.38.54-.78.76-1.54.77-1.58-.02-.01-1.48-.57-1.5-2.25-.01-1.4 1.15-2.07 1.2-2.11-.66-.97-1.68-1.08-2.04-1.1z"/>
        <text x="16" y="14.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">Pay</text>
      </g>
    </svg>
  )
}

/**
 * Small wallet badge, sized to sit beside a card brand mark in a caption.
 * Matches CardBrandIcon's bordered-box treatment so the pair reads as one row
 * of payment marks rather than two unrelated graphics.
 */
export function WalletMark({ method, className = '' }: { method: UpsellPayMethod; className?: string }) {
  if (method === 'card') return null

  /*
    Each lockup gets the box its artwork needs. Apple's is a wide glyph-plus-
    word mark (~2.5:1); Google's asset is 78x56 (~1.4:1) and already draws its
    own white tile with padding inside it — forcing both into one width was
    what made the Google mark look shrunken.
  */
  const isApple = method === 'applePay'

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center bg-white border border-[#e4e4e7] rounded-[3px] overflow-hidden ${isApple ? 'px-[3px]' : ''} ${className}`}
      style={{ width: isApple ? 38 : 34, height: 20 }}
      aria-label={WALLET_LABEL[method]}
    >
      {isApple ? (
        <ApplePayMark />
      ) : (
        <img
          src={gpaySrc}
          alt=""
          className="absolute block max-w-none"
          style={{ width: 56.5, height: 40.6, left: -11.2, top: -10.3 }}
          draggable={false}
        />
      )}
    </div>
  )
}

/**
 * The wallet's own pay button, which replaces the generic Pay CTA in the sheet.
 * Apple and Google both require their artwork to be the button rather than a
 * label on ours, so these are the same assets the express buttons use.
 */
export function WalletPayButton({
  method, onClick, disabled, radius,
}: {
  method: Exclude<UpsellPayMethod, 'card'>
  onClick: () => void
  disabled?: boolean
  radius: number
}) {
  const src = method === 'applePay' ? applePayButtonSrc : googlePayButtonSrc

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Pay with ${WALLET_LABEL[method]}`}
      className="w-full h-12 transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-default"
      style={{ background: '#000000', borderRadius: radius, overflow: 'hidden', padding: 0, border: 'none' }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full block"
        style={{ objectFit: 'contain', transform: 'scale(1.12)' }}
        draggable={false}
      />
    </button>
  )
}

/**
 * The side-button confirmation prompt.
 *
 * It shows the moment the sheet appears, not after a tap — the double-press
 * *is* the confirmation, so prompting for it only afterwards would invert the
 * flow.
 *
 * No scrim of its own: the sheet's backdrop already dims the screen behind it,
 * and a second layer would black out the sheet the player is meant to be
 * reading. pointer-events-none so it never swallows a tap.
 *
 * Note: the double-press is an Apple Face ID gesture. Google Pay on Android
 * confirms with biometrics or a PIN in a system sheet and has no side-button
 * equivalent, so showing this for Google is a deliberate prototype choice
 * rather than a reproduction of that platform's flow.
 */
export function WalletConfirm() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-start justify-end pt-28">
      <div className="flex items-center gap-3">
        <span
          className="text-[15px] leading-5 font-medium text-white"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,.45)' }}
        >
          Double Click to Pay
        </span>

        {/* Two pulses travelling toward the button, in the rhythm of a double press. */}
        <div className="flex items-center gap-1">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-[6px] h-[6px] rounded-full bg-white"
              style={{ animation: `wallet-confirm-press 1.5s ${i * 0.18}s ease-out infinite` }}
            />
          ))}
        </div>

        {/* The side button itself, flush to the device edge. */}
        <div
          className="w-[5px] h-14 rounded-l-[3px] bg-white"
          style={{ animation: 'wallet-confirm-button 1.5s ease-out infinite' }}
        />
      </div>
    </div>
  )
}
