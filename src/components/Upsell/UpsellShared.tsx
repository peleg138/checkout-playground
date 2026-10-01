import React, { useEffect, useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { CardBrandIcon } from '../Payment/PaymentIcons'
import { mockOrder } from '../../data/mockData'
import type { UpsellItem } from '../../types/upsell'

/**
 * Shared tokens for the upsell screens.
 *
 * The gutter and type sizes are the checkout's, not new ones: the approved
 * screens use a 16px gutter and lean on 14px for body copy with 16px for
 * section titles, so these screens do the same. EASE_OUT is stronger than the
 * Material curve the baseline uses — these screens enter once, and the extra
 * punch reads as intentional rather than sluggish.
 */
export const GUTTER = 'px-4'
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

/**
 * Live price from the anchor price and the configured discount, snapped down to
 * the house .90 ladder — every price in the product ends in .90 ($19.90 order
 * total, $12.90, $9.90), so a computed $9.95 has to read $9.90.
 */
export function discounted(was: number, percent: number): number {
  const raw = was * (1 - percent / 100)
  const floor = Math.floor(raw)
  const snapped = floor + 0.9 <= raw ? floor + 0.9 : floor - 1 + 0.9
  return Math.max(0.9, Number(snapped.toFixed(2)))
}

export function money(amount: number, currency = '$'): string {
  return `${currency}${amount.toFixed(2)}`
}

/**
 * Countdown for the interstitial. Stops at zero rather than looping — the
 * research note is explicit that the urgency claim needs a hard boundary.
 */
export function useCountdown(seconds: number, active: boolean): string {
  const [left, setLeft] = useState(seconds)

  useEffect(() => { setLeft(seconds) }, [seconds])

  useEffect(() => {
    if (!active || left <= 0) return
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [active, left])

  const m = Math.floor(left / 60)
  const s = left % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Payment-confirmed strip. Every variant leads with this — the whole
 * conversion argument rests on the player knowing the original sale is done.
 */
export function PaidStrip({ total, orderRef }: { total: string; orderRef: string }) {
  return (
    <div
      /* A status message, so it should announce itself. */
      role="status"
      className={`flex items-center gap-2 ${GUTTER} py-3 bg-[#f0fdf4] border-b border-[#bbf7d0] flex-shrink-0`}
    >
      {/*
        Bare check rather than a filled badge: a 16px circle wrapping an 11px
        glyph is a lot of machinery for a 36px strip, and the confirmation must
        not out-shout the offer underneath it — that offer is the screen's job.
        Matches the confirmation mark on the "Add to Your Purchase" screen.
      */}
      <Check size={13} className="text-[#16a34a] flex-shrink-0" strokeWidth={3} />

      {/*
        The amount is the token the eye is looking for, so it carries the
        weight. tabular-nums is scoped to the number — tabular figures inside
        running text just make the words sit wide.
      */}
      <span className="text-[12px] leading-4 font-medium text-[#15803d]">
        Payment confirmed · <span className="font-semibold tabular-nums">{total}</span>
      </span>

      {/*
        The ref is metadata, not part of the confirmation, so it steps out of
        the green entirely. Two greens at the same size were competing, and
        #16a34a on green-50 is 3.15:1 — still under AA for text this small.
        Zinc-600 is 7.4:1 and reads as secondary on the first glance.
      */}
      <span className="text-[12px] leading-4 font-normal text-[#52525b] ml-auto tabular-nums">
        #{orderRef}
      </span>
    </div>
  )
}

/**
 * Urgency as a banner strip, not a clock widget — AfterSell's neutral bar.
 * `tone="muted"` drops the numbers entirely for the stepper variant.
 */
export function UrgencyBanner({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'muted' }) {
  const styles = tone === 'muted'
    ? { bg: '#fffbeb', fg: '#a16207' }
    : { bg: '#f4f4f5', fg: '#3f3f46' }

  return (
    <div
      className={`flex items-center justify-center h-8 ${GUTTER} flex-shrink-0`}
      style={{ background: styles.bg }}
    >
      {/* tabular-nums: the clock ticks every second, and proportional digits
          make the whole line shift width as it counts down. */}
      <span className="text-[12px] leading-4 font-medium tabular-nums" style={{ color: styles.fg }}>
        {label}
      </span>
    </div>
  )
}

/**
 * Anchor, then live price, then the discount — reading order matches the
 * hand-made screen and the way prices are written everywhere else.
 */
export function PriceBlock({
  was,
  now,
  currency,
  percent,
  size = 'md',
}: {
  was: number
  now: number
  currency: string
  percent: number
  size?: 'sm' | 'md'
}) {
  const nowSize = size === 'md' ? 'text-[18px] leading-6' : 'text-[14px] leading-5'
  return (
    <div className="flex items-baseline gap-2">
      {percent > 0 && (
        <span className="text-[13px] leading-5 font-normal text-[#a1a1aa] line-through tabular-nums">
          {money(was, currency)}
        </span>
      )}
      <span className={`${nowSize} font-bold text-[#09090b] tabular-nums`}>{money(now, currency)}</span>
      {percent > 0 && (
        <span className="text-[11px] leading-4 font-semibold text-[#15803d] bg-[#f0fdf4] px-1.5 py-0.5 rounded-[4px] tabular-nums">
          −{Math.round(percent)}%
        </span>
      )}
    </div>
  )
}

/** The offer's contents, in the same row shape as the order summary. */
export function ItemRows({ items, multiplier = 1 }: { items: UpsellItem[]; multiplier?: number }) {
  const scale = (qty: string) => {
    if (multiplier === 1) return qty
    const n = Number(qty.replace(/,/g, ''))
    if (Number.isNaN(n)) return qty
    return (n * multiplier).toLocaleString('en-US')
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] overflow-hidden flex-shrink-0">
              <img src={item.icon} className="w-full h-full object-cover block" alt="" />
            </div>
            <span className="text-[13px] leading-5 font-normal text-[#3f3f46]">{item.name}</span>
          </div>
          {/* Quantities are a column — they have to line up on the decimal. */}
          <span className="text-[13px] leading-5 font-medium text-[#09090b] tabular-nums">
            {scale(item.qty)}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * The no-re-entry promise, made explicit. This is the mechanic the research
 * says carries the accept rate, so it gets its own line under the CTA.
 */
export function SavedMethodLine({ compact = false }: { compact?: boolean }) {
  const card = mockOrder.savedCards[0]
  const brandName = card.brand.charAt(0).toUpperCase() + card.brand.slice(1)

  return (
    <div className="flex items-center justify-center gap-1.5">
      <CardBrandIcon brand={card.brand} className="!w-[24px] !h-[16px]" />
      <span className={`${compact ? 'text-[11px] leading-4' : 'text-[12px] leading-4'} font-normal text-[#71717a] tabular-nums`}>
        Charged to {brandName} •••• {card.last4}
      </span>
    </div>
  )
}

/** Instant-grant reassurance — the games equivalent of the fulfilment hold. */
export function InstantGrantLine() {
  return (
    <div className="flex items-center justify-center gap-1">
      {/* zinc-400 on white is 2.6:1 — under AA for text this small. */}
      <Zap size={11} className="text-[#71717a]" />
      <span className="text-[11px] leading-4 font-normal text-[#71717a]">
        Added to your account instantly
      </span>
    </div>
  )
}

/**
 * Decline is always present and never equal weight to accept — true of all six
 * apps in the scan, so it is a plain text link in every variant here.
 */
export function DeclineLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-center text-[12px] leading-4 font-normal text-[#71717a] underline decoration-[#d4d4d8] underline-offset-2 hover:text-[#3f3f46] transition-colors duration-150 py-1.5"
    >
      {label}
    </button>
  )
}

/**
 * Brand-tinted glow from the button's own fill. Returns null for anything that
 * isn't a hex colour, so an unexpected value drops the glow rather than
 * emitting invalid CSS.
 */
export function glowFrom(color: string, alpha: number): string | null {
  const hex = color.trim().replace(/^#/, '')
  const full = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * Primary action. 44px tall like every other CTA in the checkout, and the press
 * scale is 0.98 — 0.99 is below the threshold where a press registers at all.
 *
 * The glint crosses roughly every 2.4s. It stops while the button is busy: a
 * highlight travelling under a spinner reads as a second, competing loading
 * indicator.
 */
export function AddButton({
  label,
  busyLabel,
  busy,
  onClick,
  color,
  radius,
}: {
  label: string
  busyLabel: string
  busy: boolean
  onClick: () => void
  color: string
  radius: number
}) {
  const glow = glowFrom(color, 0.4)

  return (
    <button
      onClick={onClick}
      disabled={busy}
      /* Transitions live on .cta-surface so transform and box-shadow can share
         one declaration — Tailwind's transition-transform would clobber it. */
      className="cta-surface relative overflow-hidden w-full h-11 text-[14px] leading-5 font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-default tabular-nums"
      style={{
        background: color,
        borderRadius: radius,
        ...(glow ? ({ '--cta-glow': glow } as React.CSSProperties) : null),
      }}
    >
      {busy ? <><Spinner /> {busyLabel}</> : label}

      {/*
        Painted after the label so the light passes over the text as well as
        the fill — a highlight that stops at the glyphs looks like a mask, not
        like light. 30% white is enough to catch the eye on the brand blue
        without hurting the label's legibility as it crosses.
      */}
      {!busy && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-3/4 animate-cta-shine"
          style={{
            // Three quarters of the button wide, with the brightness spread
            // across all of it rather than spiked at the centre. The previous
            // version peaked at 0.42 and climbed to it in 34px, so the only
            // part you actually saw was a hot, narrow stripe — its 0.07
            // shoulders were too faint to register at all. Peak 0.20 blends to
            // rgb(105,161,233) on the brand blue: a clear lift, not a white
            // bar. Seven stops keep the falloff smooth enough that no edge
            // resolves into a line.
            // 90deg, not 100: the box is already skewed 20deg, and an angled
            // gradient on top of that double-tilts the highlight.
            background: [
              'linear-gradient(90deg,',
              'transparent 0%,',
              'rgba(255,255,255,0.04) 18%,',
              'rgba(255,255,255,0.11) 34%,',
              'rgba(255,255,255,0.20) 50%,',
              'rgba(255,255,255,0.11) 66%,',
              'rgba(255,255,255,0.04) 82%,',
              'transparent 100%)',
            ].join(' '),
          }}
        />
      )}
    </button>
  )
}

/** Faster than the default spin — a quicker spinner reads as a quicker system. */
export function Spinner({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-shrink-0 animate-spin [animation-duration:700ms]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
