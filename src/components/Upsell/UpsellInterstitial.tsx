import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppearance } from '../../playground/AppearanceContext'
import { upsellPrimary, upsellOrderRef } from '../../data/upsellData'
import {
  PaidStrip, UrgencyBanner, PriceBlock, ItemRows,
  SavedMethodLine, DeclineLink, AddButton,
  discounted, money, useCountdown, GUTTER, EASE_OUT,
} from './UpsellShared'
import type { UpsellAdded } from '../../types/upsell'

interface Props {
  /** What the player already paid — the anchor the add-on is judged against. */
  paidTotal: number
  discountPercent: number
  showCountdown: boolean
  countdownSeconds: number
  onAdd: (added: UpsellAdded) => void
  onDecline: () => void
}

/**
 * Option A — one-click interstitial.
 *
 * The shape all six scanned apps converge on: full-frame offer between
 * "payment complete" and the thank-you screen, one product, one large accept,
 * price shown with the discount, small decline link underneath. Highest
 * pressure of the three, and the placement the research puts at 10-25% accept.
 */
export function UpsellInterstitial({
  paidTotal, discountPercent, showCountdown, countdownSeconds, onAdd, onDecline,
}: Props) {
  const { appearance, products } = useAppearance()
  const currency = products.currency
  const [adding, setAdding] = useState(false)

  const price = discounted(upsellPrimary.wasPrice, discountPercent)
  const timeLeft = useCountdown(countdownSeconds, showCountdown)

  const handleAdd = () => {
    setAdding(true)
    setTimeout(() => onAdd({
      id: upsellPrimary.id,
      title: upsellPrimary.title,
      price,
      icon: upsellPrimary.image,
      qty: '×1',
    }), 900)
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <PaidStrip total={money(paidTotal, currency)} orderRef={upsellOrderRef} />

      {/* Urgency lives in a neutral strip, not an alarming clock widget. */}
      {showCountdown && <UrgencyBanner label={`This offer expires in ${timeLeft}`} />}

      <div className={`flex-1 flex flex-col ${GUTTER} pt-4 pb-4 min-h-0`}>
        {/* Heading leads, card follows 60ms later — enough to read as a
            sequence, short enough not to feel like waiting. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
          className="mb-4"
        >
          <p className="text-[16px] leading-6 font-bold text-[#09090b]">Before you go</p>
          <p className="text-[13px] leading-5 font-normal text-[#71717a] mt-0.5">
            Add this to the order you just paid for — one tap, no card details.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.28, ease: EASE_OUT }}
          className="border border-[#e4e4e7] overflow-hidden bg-white"
          style={{ borderRadius: appearance.buttonRadius }}
        >
          <div className="w-full aspect-[16/9] overflow-hidden bg-[#f4f4f5]">
            <img src={upsellPrimary.image} className="w-full h-full object-cover block" alt="" />
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div>
              <p className="text-[14px] leading-5 font-semibold text-[#09090b]">{upsellPrimary.title}</p>
              <p className="text-[12px] leading-4 font-normal text-[#71717a] mt-1">{upsellPrimary.blurb}</p>
            </div>

            <div className="h-px bg-[#e4e4e7]" />
            <ItemRows items={upsellPrimary.items} />
            <div className="h-px bg-[#e4e4e7]" />

            <PriceBlock was={upsellPrimary.wasPrice} now={price} currency={currency} percent={discountPercent} />
          </div>
        </motion.div>

        {/* All slack goes above; the fixed floor below keeps the CTA the same
            distance off the frame's bottom edge on every variant. */}
        <div className="flex-1" />

        {/* Accept / decline — deliberately unequal weight. */}
        <div className="flex flex-col pt-4">
          <AddButton
            label={`Add for ${money(price, currency)}`}
            busyLabel="Adding to your order…"
            busy={adding}
            onClick={handleAdd}
            color={appearance.primaryColor}
            radius={appearance.buttonRadius}
          />
          <div className="mt-5">
            <SavedMethodLine />
          </div>
          {/* DeclineLink carries py-1.5, so mt-1 lands it ~10px below. */}
          <div className="mt-1">
            <DeclineLink label="No thanks, continue to my order" onClick={onDecline} />
          </div>
        </div>

        <div className="h-6 flex-shrink-0" />
      </div>
    </div>
  )
}
