import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Timer } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { CheckoutFooter } from '../Footer/CheckoutFooter'
import { UpsellPaySheet } from './UpsellPaySheet'
import { upsellAdvancedOffers, upsellAdvancedOrder } from '../../data/upsellData'
import { discounted, money, useCountdown, Spinner, EASE_OUT, GUTTER } from './UpsellShared'
import logoSrc from '../../assets/icons/logo.png'
import type { UpsellRowOffer, UpsellAdded } from '../../types/upsell'

/** Which of the three Advanced options to render. */
export type AdvancedMode = 'cart' | 'carousel' | 'oneTap'

interface Props {
  mode: AdvancedMode
  discountPercent: number
  /** Carousel only — how many cards to swipe through. */
  offerCount: number
  showCountdown: boolean
  countdownSeconds: number
  onReturnToGame: () => void
}

/** One offer card. Identical in all three modes apart from its CTA. */
function OfferCard({
  offer, price, currency, mode, busy, added, onAct, primaryColor, radius,
}: {
  offer: UpsellRowOffer
  price: number
  currency: string
  mode: AdvancedMode
  busy: boolean
  added: boolean
  onAct: () => void
  primaryColor: string
  radius: number
}) {
  const oneTap = mode === 'oneTap'

  return (
    <div
      className="border border-[#e4e4e7] bg-white p-3 flex flex-col gap-3"
      style={{ borderRadius: radius + 2 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-[4px] overflow-hidden flex-shrink-0">
          <img src={offer.icon} className="w-full h-full object-cover block" alt="" />
        </div>
        <span className="text-[15px] leading-5 font-semibold text-[#09090b] truncate min-w-0">{offer.name}</span>
        <span className="text-[15px] leading-5 font-normal text-[#a1a1aa] whitespace-nowrap tabular-nums">
          {offer.qty}
        </span>
        <div className="ml-auto flex items-baseline gap-1.5 flex-shrink-0 pl-2">
          <span className="text-[14px] leading-5 font-normal text-[#a1a1aa] line-through tabular-nums">
            {money(offer.wasPrice, currency)}
          </span>
          <span className="text-[15px] leading-5 font-bold text-[#09090b] tabular-nums">
            {money(price, currency)}
          </span>
        </div>
      </div>

      {/*
        One-tap settles in place: the button becomes the confirmation rather
        than a banner appearing elsewhere, so the screen never shows two
        competing confirmations.
      */}
      {added ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
          className="w-full h-11 flex items-center justify-center gap-2 bg-[#dcfce7]"
          style={{ borderRadius: radius }}
        >
          <Check size={16} className="text-[#16a34a]" strokeWidth={3} />
          <span className="text-[14px] leading-5 font-semibold text-[#15803d]">Added to Purchase</span>
        </motion.div>
      ) : (
        <button
          onClick={onAct}
          disabled={busy}
          className="w-full h-11 text-[14px] leading-5 font-semibold text-white flex items-center justify-center gap-2 transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-default tabular-nums"
          style={{ background: primaryColor, borderRadius: radius }}
        >
          {busy
            ? <><Spinner /> Adding…</>
            : oneTap ? `Buy now ${money(price, currency)}` : `Add to Cart ${money(price, currency)}`}
        </button>
      )}

      <p className="text-[12px] leading-4 font-normal text-[#71717a] text-center tabular-nums">
        {oneTap
          ? `Charged automatically to Visa ${upsellAdvancedOrder.cardLast4}`
          : `Charged to the same card, Visa ${upsellAdvancedOrder.cardLast4}`}
      </p>
    </div>
  )
}

/**
 * The three "Advanced" options from the research board, which differ only in
 * how the offer is actioned:
 *
 *   cart     — Add to Cart, then a sheet confirms the second charge
 *   carousel — the same, with the offer in a swipeable set
 *   oneTap   — Buy now charges the stored card outright, no sheet
 *
 * Everything around the CTA is shared, which is the point: the board is asking
 * which action model to ship, not which layout.
 */
export function UpsellAdvanced({
  mode, discountPercent, offerCount, showCountdown, countdownSeconds, onReturnToGame,
}: Props) {
  const { appearance, products } = useAppearance()
  const currency = products.currency
  const radius = appearance.buttonRadius
  const timeLeft = useCountdown(countdownSeconds, showCountdown)

  const offers = mode === 'carousel'
    ? upsellAdvancedOffers.slice(0, Math.max(1, Math.min(3, offerCount)))
    : upsellAdvancedOffers.slice(0, 1)

  const [added, setAdded] = useState<UpsellAdded[]>([])
  const [pending, setPending] = useState<string | null>(null)
  const [sheetFor, setSheetFor] = useState<UpsellRowOffer | null>(null)
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  const priceOf = (o: UpsellRowOffer) => discounted(o.wasPrice, discountPercent)

  const commit = (offer: UpsellRowOffer) => {
    setAdded(prev => prev.some(a => a.id === offer.id) ? prev : [...prev, {
      id: offer.id, title: offer.name, price: priceOf(offer), icon: offer.icon, qty: offer.qty,
    }])
  }

  /** One tap charges straight away; the other two open the sheet first. */
  const act = (offer: UpsellRowOffer) => {
    if (pending) return
    if (mode === 'oneTap') {
      setPending(offer.id)
      setTimeout(() => { commit(offer); setPending(null) }, 600)
    } else {
      setSheetFor(offer)
    }
  }

  const payFromSheet = () => {
    if (!sheetFor) return
    setPending(sheetFor.id)
    setTimeout(() => {
      commit(sheetFor)
      setPending(null)
      setSheetFor(null)
    }, 600)
  }

  // Which card the carousel has settled on, for the pagination pills.
  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    const card = el.scrollWidth / offers.length
    setActive(Math.round(el.scrollLeft / card))
  }

  return (
    <div className="w-full h-full flex flex-col bg-white relative overflow-hidden">
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
        {/*
          Success first, and uninterrupted — the board's first design rule. The
          confirmation owns the top and the offer never precedes it.
        */}
        <div className="bg-[#f0fdf4] rounded-[8px] px-3 py-2.5 flex-shrink-0" role="status">
          <p className="text-[14px] leading-5 font-semibold text-[#15803d]">Payment Successful</p>
          <p className="text-[12px] leading-4 font-normal text-[#4d7c5f] mt-0.5 tabular-nums">
            {money(upsellAdvancedOrder.paidAmount, currency)} charged to Visa {upsellAdvancedOrder.cardLast4}
            <span className="mx-1.5 text-[#86bf9b]">·</span>
            Order {upsellAdvancedOrder.orderId}
          </p>
        </div>

        {/*
          Validity, not urgency. The board is explicit that a countdown here is
          a compliance device — the window is visible before it lapses so an
          expiry is never experienced as a payment error. Sitting against the
          confirmation, it reads as a property of the offer below it.
        */}
        <AnimatePresence initial={false}>
          {showCountdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="overflow-hidden flex-shrink-0 -mx-4 mt-5"
            >
              <div className="h-8 bg-[#f4f4f5] flex items-center justify-center gap-1.5">
                <Timer size={12} className="text-[#71717a]" />
                <span className="text-[12px] leading-4 font-normal text-[#71717a] tabular-nums">
                  Offer expires in {timeLeft}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-shrink-0 mt-6">
          <p className="text-[16px] leading-6 font-bold text-[#09090b]">Add to Your Purchase</p>
          <p className="text-[13px] leading-5 font-normal text-[#71717a] mt-0.5">
            One-time offer before you return to the game
          </p>
        </div>

        {mode === 'carousel' ? (
          <div className="mt-3 flex-shrink-0">
            {/* Full-bleed scroller so neighbouring cards peek into the gutter. */}
            <div
              ref={scroller}
              onScroll={onScroll}
              className="-mx-4 px-4 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
              {offers.map(offer => (
                <div key={offer.id} className="w-[343px] flex-shrink-0 snap-center">
                  <OfferCard
                    offer={offer}
                    price={priceOf(offer)}
                    currency={currency}
                    mode={mode}
                    busy={pending === offer.id}
                    added={added.some(a => a.id === offer.id)}
                    onAct={() => act(offer)}
                    primaryColor={appearance.primaryColor}
                    radius={radius}
                  />
                </div>
              ))}
            </div>

            {offers.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3" aria-hidden="true">
                {offers.map((o, i) => (
                  <div
                    key={o.id}
                    className="h-1.5 rounded-full transition-all duration-200 ease-out"
                    style={{
                      width: i === active ? 16 : 6,
                      background: i === active ? appearance.primaryColor : '#d4d4d8',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 flex-shrink-0">
            <OfferCard
              offer={offers[0]}
              price={priceOf(offers[0])}
              currency={currency}
              mode={mode}
              busy={pending === offers[0].id}
              added={added.some(a => a.id === offers[0].id)}
              onAct={() => act(offers[0])}
              primaryColor={appearance.primaryColor}
              radius={radius}
            />
          </div>
        )}

        {/* A clean exit that is always available. */}
        <button
          onClick={onReturnToGame}
          className="w-full text-center text-[14px] leading-5 font-semibold text-[#09090b] underline decoration-[#d4d4d8] underline-offset-2 py-4 mt-1 flex-shrink-0 transition-colors duration-150 hover:text-[#3f3f46]"
        >
          return to game
        </button>

        <div className="h-2 flex-shrink-0" />
      </div>


      <CheckoutFooter className="flex-shrink-0 border-t border-[#e4e4e7]" />

      <UpsellPaySheet
        open={sheetFor !== null}
        offer={sheetFor}
        price={sheetFor ? priceOf(sheetFor) : 0}
        currency={currency}
        paying={pending !== null}
        onPay={payFromSheet}
        onClose={() => setSheetFor(null)}
      />
    </div>
  )
}
