import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { upsellPrimary, upsellPacks, upsellOrderRef } from '../../data/upsellData'
import {
  UrgencyBanner, PriceBlock, ItemRows,
  SavedMethodLine, InstantGrantLine, DeclineLink, AddButton,
  discounted, money, glowFrom, GUTTER, EASE_OUT,
} from './UpsellShared'
import type { UpsellAdded } from '../../types/upsell'

interface Props {
  paidTotal: number
  discountPercent: number
  showPackSelector: boolean
  onAdd: (added: UpsellAdded) => void
  onDecline: () => void
}

const STEPS = ['Cart', 'Paid', 'Offer', 'Done'] as const
const ACTIVE_STEP = 2

/**
 * Four-step rail — the offer is a declared step, not an ambush.
 *
 * The dot row and the label row are separate: labels don't all wrap the same
 * way, and with one row a wrap dragged the dots and connectors out of
 * alignment. A fixed label height keeps the rail level whatever the labels do.
 *
 * Emphasis is graduated rather than uniform — the active step is larger with a
 * halo, completed steps are smaller, upcoming ones are flat grey fills.
 */
function ProgressRail({ color }: { color: string }) {
  return (
    <div
      className={`${GUTTER} pt-4 pb-3 flex-shrink-0`}
      /* Progress is meaningful, not decorative — it should be announced. */
      role="group"
      aria-label={`Step ${ACTIVE_STEP + 1} of ${STEPS.length}: ${STEPS[ACTIVE_STEP]}`}
    >
      {/* Dots and connectors */}
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const done = i < ACTIVE_STEP
          const active = i === ACTIVE_STEP
          const size = active ? 20 : 16
          return (
            <React.Fragment key={label}>
              <div className="relative z-10 flex justify-center flex-shrink-0" style={{ width: 48 }}>
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    width: size,
                    height: size,
                    // Upcoming steps are a flat grey fill rather than a white
                    // circle with a border — an outline read as a different
                    // kind of object next to the filled ones.
                    background: done || active ? color : '#e4e4e7',
                    boxShadow: active ? `0 0 0 4px ${glowFrom(color, 0.18) ?? 'transparent'}` : 'none',
                  }}
                >
                  {done && <Check size={10} color="white" strokeWidth={2.5} />}
                  {active && <div className="w-[7px] h-[7px] rounded-full bg-white" />}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="relative z-0 flex-1 h-[2px] rounded-full -mx-4"
                  style={{ background: i < ACTIVE_STEP ? color : '#e4e4e7' }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Labels, on their own row with a fixed height */}
      <div className="flex items-start mt-2 h-4">
        {STEPS.map((label, i) => {
          const done = i < ACTIVE_STEP
          const active = i === ACTIVE_STEP
          return (
            <React.Fragment key={label}>
              <span
                className="text-[11px] leading-4 text-center flex-shrink-0"
                aria-hidden="true"
                style={{
                  width: 48,
                  color: active ? '#09090b' : done ? '#52525b' : '#a1a1aa',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1" />}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
/**
 * Option B — the same slot as A, reframed as a step.
 *
 * Explicit 4-step rail (AfterSell), muted urgency with a hard boundary
 * ("expires when you leave this page") instead of a countdown, and a pack
 * selector so the offer isn't locked to one SKU (True Classic). Trades some
 * accept rate for the perception that this is part of the flow.
 */
export function UpsellStepper({ paidTotal, discountPercent, showPackSelector, onAdd, onDecline }: Props) {
  const { appearance, products } = useAppearance()
  const currency = products.currency
  const [packId, setPackId] = useState(upsellPacks[0].id)
  const [adding, setAdding] = useState(false)

  const pack = upsellPacks.find(p => p.id === packId) ?? upsellPacks[0]

  const onPackKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = upsellPacks.length - 1
    let next = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else return
    e.preventDefault()
    setPackId(upsellPacks[next].id)
    const group = e.currentTarget.parentElement
    ;(group?.children[next] as HTMLElement | undefined)?.focus()
  }
  const was = showPackSelector ? pack.wasPrice : upsellPrimary.wasPrice
  const multiplier = showPackSelector ? pack.multiplier : 1
  const price = discounted(was, discountPercent)

  const handleAdd = () => {
    setAdding(true)
    setTimeout(() => onAdd({
      id: upsellPrimary.id,
      title: upsellPrimary.title,
      price,
      icon: upsellPrimary.image,
      qty: pack.label,
    }), 900)
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <ProgressRail color={appearance.primaryColor} />
      <div className="h-px bg-[#e4e4e7] flex-shrink-0" />

      {/* Muted, no numbers — pressure scales down when the offer is framed as a step. */}
      <UrgencyBanner label="This offer expires when you leave this page" tone="muted" />

      <div className={`flex-1 flex flex-col ${GUTTER} pt-4 pb-4 min-h-0`}>
        <div className="mb-4">
          <p className="text-[16px] leading-6 font-bold text-[#09090b]">One-time add-on</p>
          <p className="text-[13px] leading-5 font-normal text-[#71717a] mt-0.5 tabular-nums">
            Order #{upsellOrderRef} is confirmed at {money(paidTotal, currency)}. Add one more before you head back.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: EASE_OUT }}
          className="border border-[#e4e4e7] bg-white p-4 flex flex-col gap-4"
          style={{ borderRadius: appearance.buttonRadius }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[6px] overflow-hidden flex-shrink-0 bg-[#f4f4f5]">
              <img src={upsellPrimary.image} className="w-full h-full object-cover block" alt="" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] leading-5 font-semibold text-[#09090b]">{upsellPrimary.title}</p>
              <p className="text-[12px] leading-4 font-normal text-[#71717a] mt-1">{upsellPrimary.blurb}</p>
            </div>
          </div>

          {/* Pack selector — locked selected-state tokens: tinted fill + primary stroke. */}
          {showPackSelector && (
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Pack size">
                {upsellPacks.map((p, i) => {
                  const selected = p.id === packId
                  const total = discounted(p.wasPrice, discountPercent)
                  const unit = total / p.multiplier
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPackId(p.id)}
                      onKeyDown={e => onPackKeyDown(e, i)}
                      role="radio"
                      aria-checked={selected}
                      /* One tab stop for the group; arrows move within it. */
                      tabIndex={selected ? 0 : -1}
                      aria-label={`${p.label}, ${money(total, currency)}, ${money(unit, currency)} each`}
                      className="py-2.5 flex flex-col items-center justify-center gap-1 transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]"
                      style={{
                        borderRadius: appearance.buttonRadius,
                        border: `1px solid ${selected ? appearance.primaryColor : '#e4e4e7'}`,
                        background: selected ? '#EFF6FF' : '#fff',
                        // A second ring rather than a 2px border: it reads as a
                        // heavier edge without changing the box, so the tile
                        // doesn't shift by a pixel when selection moves.
                        boxShadow: selected ? `0 0 0 1px ${appearance.primaryColor}` : 'none',
                      }}
                    >
                      <span className="text-[13px] leading-4 font-semibold text-[#09090b] tabular-nums">{p.label}</span>
                      <span
                        className="text-[11px] leading-4 tabular-nums transition-colors duration-150 ease-out"
                        style={{
                          color: selected ? appearance.primaryColor : '#71717a',
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {money(total, currency)}
                      </span>
                    </button>
                  )
                })}
            </div>
          )}

          <div className="h-px bg-[#e4e4e7]" />
          <ItemRows items={upsellPrimary.items} multiplier={multiplier} />
          <div className="h-px bg-[#e4e4e7]" />

          <PriceBlock was={was} now={price} currency={currency} percent={discountPercent} size="sm" />
        </motion.div>

        {/* All slack goes above; the fixed floor below keeps the CTA the same
            distance off the frame's bottom edge on every variant. */}
        <div className="flex-1" />

        <div className="flex flex-col pt-4">
          <AddButton
            label={`Add to my order — ${money(price, currency)}`}
            busyLabel="Adding to your order…"
            busy={adding}
            onClick={handleAdd}
            color={appearance.primaryColor}
            radius={appearance.buttonRadius}
          />
          <div className="mt-5 flex flex-col gap-1.5">
            <SavedMethodLine />
            <InstantGrantLine />
          </div>
          {/* DeclineLink carries py-1.5, so mt-1 lands it ~10px below. */}
          <div className="mt-1">
            <DeclineLink label="Skip this offer" onClick={onDecline} />
          </div>
        </div>

        <div className="h-6 flex-shrink-0" />
      </div>
    </div>
  )
}
