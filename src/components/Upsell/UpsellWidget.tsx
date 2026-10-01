import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { upsellParallel, upsellMilestone } from '../../data/upsellData'
import { discounted, money, SavedMethodLine, EASE_OUT } from './UpsellShared'
import type { UpsellOffer, UpsellAdded } from '../../types/upsell'

interface Props {
  discountPercent: number
  /** 1 or 2 parallel offers. */
  offerCount: number
  showMilestone: boolean
  onClaim: (added: UpsellAdded) => void
}

/** One parallel offer. Its own Claim CTA — no accept/decline binary anywhere. */
function OfferCard({
  offer, discountPercent, currency, claimed, wide, delay, onClaim, primaryColor, radius,
}: {
  offer: UpsellOffer
  discountPercent: number
  currency: string
  claimed: boolean
  wide: boolean
  delay: number
  onClaim: () => void
  primaryColor: string
  radius: number
}) {
  const price = discounted(offer.wasPrice, discountPercent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.26, ease: EASE_OUT }}
      className="border border-[#e4e4e7] bg-white overflow-hidden flex flex-col text-left"
      style={{ borderRadius: radius }}
    >
      <div className={`w-full overflow-hidden bg-[#f4f4f5] ${wide ? 'aspect-[21/9]' : 'aspect-[16/9]'}`}>
        <img src={offer.image} className="w-full h-full object-cover block" alt="" />
      </div>

      <div className="p-3 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <p className="text-[13px] leading-4 font-semibold text-[#09090b]">{offer.title}</p>
          {/*
            Two lines reserved whatever the copy does. One card's blurb fit on
            one line and the other's wrapped to two, so the pair weren't the
            same shape — and any new offer would have reshuffled them again.
          */}
          <p className="text-[11px] leading-4 font-normal text-[#71717a] mt-1 h-8 line-clamp-2">
            {offer.blurb}
          </p>
        </div>

        {/*
          Price and button are one group. They were separated by the same gap
          that sat above the price, leaving it floating between the description
          and the CTA when it belongs to the CTA.
        */}
        <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[14px] leading-5 font-bold text-[#09090b] tabular-nums">
            {money(price, currency)}
          </span>
          {discountPercent > 0 && (
            <span className="text-[11px] leading-4 font-normal text-[#a1a1aa] line-through tabular-nums">
              {money(offer.wasPrice, currency)}
            </span>
          )}
        </div>

        {claimed ? (
          <div
            className="w-full h-9 flex items-center justify-center gap-1.5 bg-[#f0fdf4]"
            style={{ borderRadius: radius }}
          >
            <Check size={12} className="text-[#16a34a]" strokeWidth={3} />
            <span className="text-[12px] leading-4 font-medium text-[#15803d]">Added</span>
          </div>
        ) : (
          <button
            onClick={onClaim}
            className="w-full h-9 text-[12px] leading-4 font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.98]"
            style={{ background: primaryColor, borderRadius: radius }}
          >
            Claim this offer
          </button>
        )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Option C — success-screen widget.
 *
 * Lives permanently under the confirmation: no timer, no interstitial, two
 * parallel offers each with its own CTA. This is the closest analogue to the
 * Post Purchase Popup already in the product, so it doubles as the "does the
 * current version hold up" comparison. The milestone card is the game-native
 * pattern from the research — triggered by progress, not by the purchase.
 */
export function UpsellWidget({ discountPercent, offerCount, showMilestone, onClaim }: Props) {
  const { appearance, products } = useAppearance()
  const currency = products.currency
  const [claimed, setClaimed] = useState<string[]>([])

  const offers = upsellParallel.slice(0, Math.max(1, Math.min(2, offerCount)))
  const milestonePrice = discounted(upsellMilestone.wasPrice, discountPercent)

  const claim = (offer: UpsellOffer, price: number) => {
    if (claimed.includes(offer.id)) return
    setClaimed(c => [...c, offer.id])
    onClaim({ id: offer.id, title: offer.title, price, icon: offer.image, qty: '×1' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      /* The confirmation's own animation settles by ~0.45s. Waiting longer than
         that is just dead time on a screen the player is already reading. */
      transition={{ delay: 0.45, duration: 0.28, ease: EASE_OUT }}
      className="w-full flex flex-col gap-3 mt-6"
    >
      <div className="h-px bg-[#e4e4e7] -mb-1" />

      <span className="text-[11px] leading-4 font-semibold tracking-[.06em] uppercase text-[#71717a]">
        Recommended for you
      </span>

      <div className={offers.length > 1 ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-1 gap-2.5'}>
        {offers.map((offer, i) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            discountPercent={discountPercent}
            currency={currency}
            claimed={claimed.includes(offer.id)}
            wide={offers.length === 1}
            delay={0.5 + i * 0.06}
            onClaim={() => claim(offer, discounted(offer.wasPrice, discountPercent))}
            primaryColor={appearance.primaryColor}
            radius={appearance.buttonRadius}
          />
        ))}
      </div>

      {/* Milestone offer — progress-triggered, not payment-triggered. */}
      {showMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + offers.length * 0.06, duration: 0.26, ease: EASE_OUT }}
          className="border border-[#e4e4e7] bg-[#fafafa] p-3 mt-1 flex items-center gap-3 text-left"
          style={{ borderRadius: appearance.buttonRadius }}
        >
          <div className="w-11 h-11 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#f4f4f5]">
            <img src={upsellMilestone.image} className="w-full h-full object-cover block" alt="" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <Sparkles size={11} className="text-[#a16207] flex-shrink-0" />
              <p className="text-[13px] leading-4 font-semibold text-[#09090b] truncate">
                {upsellMilestone.title}
              </p>
            </div>
            <p className="text-[11px] leading-4 font-normal text-[#71717a] mt-1">
              {upsellMilestone.blurb}
            </p>
          </div>

          {claimed.includes(upsellMilestone.id) ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Check size={12} className="text-[#16a34a]" strokeWidth={3} />
              <span className="text-[12px] leading-4 font-medium text-[#15803d]">Added</span>
            </div>
          ) : (
            <button
              onClick={() => claim(upsellMilestone, milestonePrice)}
              className="h-9 px-3 text-[12px] leading-4 font-semibold text-white flex-shrink-0 transition-transform duration-150 ease-out active:scale-[0.98] tabular-nums"
              style={{ background: appearance.primaryColor, borderRadius: appearance.buttonRadius }}
            >
              {money(milestonePrice, currency)}
            </button>
          )}
        </motion.div>
      )}

      <SavedMethodLine compact />
    </motion.div>
  )
}
