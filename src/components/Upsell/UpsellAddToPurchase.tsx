import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { CheckoutFooter } from '../Footer/CheckoutFooter'
import { upsellRows, upsellReceipt } from '../../data/upsellData'
import { discounted, money, useCountdown, UrgencyBanner, Spinner, EASE_OUT, GUTTER } from './UpsellShared'
import logoSrc from '../../assets/icons/logo.png'
import type { UpsellRowOffer, UpsellAdded } from '../../types/upsell'

interface Props {
  paidTotal: number
  discountPercent: number
  /** 1-3 rows. */
  offerCount: number
  /**
   * Optional. The research puts this variant at the low-pressure end — it is
   * the confirmation screen, the furthest point from the moment of payment,
   * and the scan found urgency scaling down as offers move that way. Off by
   * default in spirit; the playground decides.
   */
  showCountdown: boolean
  countdownSeconds: number
  /** Leaves the flow — this screen is the confirmation, so there is no screen after it. */
  onReturnToGame: () => void
}

/** One offer row: item, quantity, anchor, live price, and its own Pay button. */
/**
 * One offer row, in two states that share a single skeleton.
 *
 * The first version returned two different trees for added/not-added. React
 * reconciled them to the same motion.div — same type, same position, no key —
 * so `initial` never ran (it only applies on mount) and nothing faded: the
 * 32px product icon snapped to a 15px check, the padding and flex direction
 * changed instantly, and `layout` scaled the 112px box down to 48px while its
 * children weren't layout-aware, stretching the text on the way.
 *
 * Here the identity row — icon, name, quantity, price — is mounted once and
 * never changes shape. Claiming only collapses the button away and fades the
 * pill in, so there is nothing to distort and no `layout` prop needed: the
 * card's height follows its children, so it shrinks continuously and the rows
 * below slide up with it.
 */
function OfferRow({
  offer, price, currency, percent, added, adding, onPay, primaryColor, radius,
}: {
  offer: UpsellRowOffer
  price: number
  currency: string
  percent: number
  added: boolean
  adding: boolean
  onPay: () => void
  primaryColor: string
  radius: number
}) {
  return (
    <div
      className="border border-[#e4e4e7] overflow-hidden transition-colors duration-300 ease-out"
      style={{ borderRadius: radius, background: added ? '#fafafa' : '#ffffff' }}
    >
      {/* Stable in both states — nothing here mounts, unmounts or moves. */}
      <div className="h-14 px-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-[4px] overflow-hidden flex-shrink-0">
          <img src={offer.icon} className="w-full h-full object-cover block" alt="" />
        </div>

        <span
          className="text-[14px] leading-5 font-semibold truncate min-w-0 transition-colors duration-300 ease-out"
          style={{ color: added ? '#52525b' : '#09090b' }}
        >
          {offer.name}
        </span>
        <span
          className="text-[14px] leading-5 font-normal whitespace-nowrap tabular-nums transition-colors duration-300 ease-out"
          style={{ color: added ? '#a1a1aa' : '#71717a' }}
        >
          {offer.qty}
        </span>

        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0 pl-2">
          {/*
            One fixed slot holding either the strikethrough anchor or the Added
            pill, cross-fading in place. The pill lived next to the name before,
            where it stole width from a `truncate` span and clipped "Coins" to
            "Coi…" the instant a row was claimed. Here the width is reserved
            either way, so claiming reflows nothing at all — and the anchor is
            exactly what the pill should replace: both answer "what does this
            cost", before and after.
          */}
          <div className="relative h-5 w-[58px] flex-shrink-0">
            <AnimatePresence initial={false}>
              {added ? (
                <motion.span
                  key="pill"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.22, ease: EASE_OUT, delay: 0.08 }}
                  className="absolute inset-0 flex items-center justify-center gap-0.5 text-[11px] leading-4 font-semibold text-[#15803d] bg-[#dcfce7] rounded-full"
                >
                  <Check size={11} strokeWidth={3} />
                  Added
                </motion.span>
              ) : percent > 0 ? (
                <motion.span
                  key="anchor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  className="absolute inset-0 flex items-center justify-end text-[14px] leading-5 font-normal text-[#a1a1aa] line-through tabular-nums"
                >
                  {money(offer.wasPrice, currency)}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
          {/* Weight holds steady — bold to normal is a snap no easing can hide. */}
          <span
            className="text-[14px] leading-5 font-semibold tabular-nums transition-colors duration-300 ease-out"
            style={{ color: added ? '#a1a1aa' : '#09090b' }}
          >
            {money(price, currency)}
          </span>
        </div>
      </div>

      {/*
        The button collapses via height on an overflow-hidden wrapper — the one
        reliable way to animate a box out of a flow without scaling it. Exit is
        quicker than enter: the system responding should feel faster than the
        player deciding.
      */}
      <AnimatePresence initial={false}>
        {!added && (
          <motion.div
            key="pay"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <button
                onClick={onPay}
                disabled={adding}
                className="w-full h-11 text-[14px] leading-5 font-semibold text-white flex items-center justify-center gap-2 transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-default tabular-nums"
                style={{ background: primaryColor, borderRadius: radius }}
              >
                {adding
                  ? <><Spinner /> Adding…</>
                  : <>Pay {money(price, currency)}</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Option D — "Add to Your Purchase".
 *
 * The hand-made Appcharge version, kept intact and corrected against the
 * research. It is already the shape the scan says fits this slot best: the
 * confirmation and the offers on one screen, parallel rows each with their own
 * CTA (not an accept/decline binary), and no urgency mechanic at all — which is
 * exactly right for an offer this far from the moment of payment.
 *
 * What changed from the original:
 *  - every row shows the same number in the price and the Pay button (the
 *    Booster row read $4.90 next to a "Pay $9.90" button);
 *  - every row carries a strikethrough anchor, so the add-on is priced against
 *    something — the anchoring effect the research credits for this placement;
 *  - "will be charged automatically" became an explicit no-re-entry promise;
 *    "automatically" reads as a standing authorisation, which is the one claim
 *    the compliance note says may not survive processor review;
 *  - adding an item now updates the order block with a new total, so the
 *    "one click appends it to the original order" mechanic is visible.
 */
export function UpsellAddToPurchase({
  paidTotal, discountPercent, offerCount, showCountdown, countdownSeconds, onReturnToGame,
}: Props) {
  const { appearance, products } = useAppearance()
  const currency = products.currency
  const radius = appearance.buttonRadius

  const timeLeft = useCountdown(countdownSeconds, showCountdown)

  const [added, setAdded] = useState<UpsellAdded[]>([])
  const [pending, setPending] = useState<string | null>(null)

  const rows: UpsellRowOffer[] = upsellRows.slice(0, Math.max(1, Math.min(3, offerCount)))

  const addedTotal = added.reduce((sum, a) => sum + a.price, 0)
  const runningTotal = paidTotal + addedTotal

  const pay = (offer: UpsellRowOffer, price: number) => {
    if (pending || added.some(a => a.id === offer.id)) return
    setPending(offer.id)
    setTimeout(() => {
      setAdded(prev => [...prev, { id: offer.id, title: offer.name, price, icon: offer.icon, qty: offer.qty }])
      setPending(null)
    }, 600)
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Game header */}
      <div className={`flex items-center gap-2.5 ${GUTTER} h-16 flex-shrink-0`}>
        <img
          src={products.gameLogo || logoSrc}
          alt=""
          className="w-10 h-10 rounded-[6px] object-contain flex-shrink-0"
          draggable={false}
        />
        <span className="text-[17px] leading-6 font-bold text-[#09090b]">
          {products.gameName || 'Royal Blast'}
        </span>
        <button
          onClick={onReturnToGame}
          className="ml-auto -mr-1.5 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#f4f4f5] active:bg-[#e4e4e7]"
          aria-label="Close"
        >
          <X size={20} className="text-[#09090b]" strokeWidth={2.5} />
        </button>
      </div>

      <div className={`flex-1 flex flex-col ${GUTTER} min-h-0 overflow-y-auto scrollbar-hide`}>
        {/* Confirmation */}
        <div className="flex flex-col items-center pt-3 pb-4 flex-shrink-0">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          >
            <Check size={36} className="text-[#22c55e]" strokeWidth={2.75} />
          </motion.div>
          <p className="text-[16px] leading-6 font-bold text-[#09090b] mt-2">Purchase Completed</p>
        </div>

        <div className="flex items-baseline justify-between flex-shrink-0">
          <span className="text-[16px] leading-6 font-bold text-[#09090b]">
            {products.offerTitle || 'Special Offer'}
          </span>
          <span className="text-[16px] leading-6 font-bold text-[#09090b] tabular-nums">
            {money(paidTotal, currency)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 mt-1 flex-shrink-0">
          <span className="text-[12px] leading-4 font-normal text-[#71717a] whitespace-nowrap">
            Order {upsellReceipt.orderId}
          </span>
          <span className="text-[12px] leading-4 font-normal text-[#71717a] truncate">
            Receipt sent to {upsellReceipt.email}
          </span>
        </div>

        {/* Appended add-ons and the new total — the mechanic made visible. */}
        <AnimatePresence>
          {added.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.26, ease: EASE_OUT }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="pt-2 flex flex-col gap-1">
                {added.map(a => (
                  <div key={a.id} className="flex items-baseline justify-between">
                    <span className="text-[12px] leading-5 font-normal text-[#15803d]">
                      Added · {a.title} {a.qty}
                    </span>
                    <span className="text-[12px] leading-5 font-normal text-[#15803d] tabular-nums">
                      +{money(a.price, currency)}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between border-t border-[#e4e4e7] pt-2 mt-2">
                  <span className="text-[13px] leading-5 font-bold text-[#09090b]">Total charged</span>
                  <span className="text-[13px] leading-5 font-bold text-[#09090b] tabular-nums">
                    {money(runningTotal, currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px bg-[#e4e4e7] my-3 flex-shrink-0" />

        {showCountdown && (
          <div className="-mx-4 mb-3 flex-shrink-0">
            <UrgencyBanner label={`This offer expires in ${timeLeft}`} />
          </div>
        )}

        {/* Offers */}
        <div className="flex-shrink-0">
          <p className="text-[16px] leading-6 font-bold text-[#09090b]">Add to Your Purchase</p>
          <p className="text-[12px] leading-4 font-normal text-[#71717a] mt-1">
            Charged to your Card •••• {upsellReceipt.cardLast4}. No card details needed.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4 flex-shrink-0">
          {rows.map(offer => {
            const price = discounted(offer.wasPrice, discountPercent)
            return (
              <OfferRow
                key={offer.id}
                offer={offer}
                price={price}
                currency={currency}
                percent={discountPercent}
                added={added.some(a => a.id === offer.id)}
                adding={pending === offer.id}
                onPay={() => pay(offer, price)}
                primaryColor={appearance.primaryColor}
                radius={radius}
              />
            )
          })}

        </div>

        {/* Decline: in the flow, right after the last offer. */}
        <button
          onClick={onReturnToGame}
          className="w-full text-center text-[14px] leading-5 font-semibold text-[#09090b] underline decoration-[#d4d4d8] underline-offset-2 py-4 flex-shrink-0 transition-colors duration-150 hover:text-[#3f3f46]"
        >
          {added.length > 0 ? 'Done, return to game' : 'No thanks, return to game'}
        </button>

        <div className="h-2 flex-shrink-0" />
      </div>

      <CheckoutFooter className="flex-shrink-0 border-t border-[#e4e4e7]" />
    </div>
  )
}
