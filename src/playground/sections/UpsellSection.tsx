import React from 'react'
import { TrendingUp, Play } from 'lucide-react'
import { ConfigSection, ControlRow } from '../ui/ConfigSection'
import { Toggle } from '../ui/Toggle'
import { SegmentedControl } from '../ui/SegmentedControl'
import { RangeSlider } from '../ui/RangeSlider'
import type { UpsellConfig } from '../types'
import type { UpsellVariant } from '../../types/upsell'

interface Props {
  config: UpsellConfig
  onChange: (c: UpsellConfig) => void
  /** Jumps the preview straight to the offer screen. */
  onJump?: () => void
  isOpen?: boolean
  onToggle?: () => void
}

const VARIANTS: Array<{ value: UpsellVariant; label: string }> = [
  { value: 'off',      label: 'Off' },
  { value: 'cart',     label: '1' },
  { value: 'carousel', label: '2' },
  { value: 'oneTap',   label: '3' },
]

const BLURBS: Record<UpsellVariant, string> = {
  off: 'No post-purchase offer — the flow goes straight from payment to the success screen.',
  cart: '1 · Add to Cart. One offer on the completed page; the CTA opens a sheet that confirms the second charge before it happens.',
  carousel: '2 · Carousel. The same two-step flow, with several offers to swipe through. Note the board’s rule: one card, not a grid, until the offer set is dynamic.',
  oneTap: '3 · Buy now. One tap charges the stored card outright with no sheet, and the button settles into "Added to Purchase".',
}

export function UpsellSection({ config, onChange, onJump, isOpen, onToggle }: Props) {
  const set = <K extends keyof UpsellConfig>(key: K, value: UpsellConfig[K]) =>
    onChange({ ...config, [key]: value })

  const isOff = config.variant === 'off'

  return (
    <ConfigSection title="Post-Purchase Upsell" icon={<TrendingUp size={15} />} isOpen={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SegmentedControl
          options={VARIANTS}
          value={config.variant}
          onChange={v => set('variant', v)}
          fullWidth
        />

        <p style={{ fontSize: 11, lineHeight: '15px', color: '#71717a', margin: '2px 0 4px' }}>
          {BLURBS[config.variant]}
        </p>

        {!isOff && (
          <>
            <button
              onClick={onJump}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 30, border: '1px solid #e4e4e7', borderRadius: 6,
                background: '#fff', color: '#3f3f46',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9fb' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <Play size={11} /> Jump to the offer screen
            </button>

            <div style={{ height: 1, background: '#e4e4e7', marginTop: 4 }} />

            <ControlRow label="Pay with">
              <SegmentedControl
                options={[
                  { value: 'card', label: 'Card' },
                  { value: 'applePay', label: 'Apple' },
                  { value: 'googlePay', label: 'Google' },
                ]}
                value={config.payWith ?? 'card'}
                onChange={v => set('payWith', v as UpsellConfig['payWith'])}
              />
            </ControlRow>

            <ControlRow label={`Discount — ${config.discountPercent}%`}>
              <div style={{ width: 110 }}>
                <RangeSlider
                  value={config.discountPercent}
                  min={0} max={70} step={5}
                  onChange={v => set('discountPercent', v)}
                />
              </div>
            </ControlRow>

            {config.variant === 'carousel' && (
              <ControlRow label="Offers in carousel">
                <SegmentedControl
                  options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]}
                  value={String(config.widgetOfferCount)}
                  onChange={v => set('widgetOfferCount', Number(v))}
                />
              </ControlRow>
            )}

            {/*
              Labelled "validity", not "countdown": the board is explicit that a
              timer here is a compliance device — the window is shown before it
              lapses so an expiry is never experienced as a payment error.
            */}
            <ControlRow label="Timer">
              <Toggle checked={config.showCountdown} onCheckedChange={v => set('showCountdown', v)} />
            </ControlRow>
            {config.showCountdown && (
              <ControlRow label={`Window — ${Math.floor(config.countdownSeconds / 60)}:${String(config.countdownSeconds % 60).padStart(2, '0')}`}>
                <div style={{ width: 110 }}>
                  <RangeSlider
                    value={config.countdownSeconds}
                    min={30} max={600} step={30}
                    onChange={v => set('countdownSeconds', v)}
                  />
                </div>
              </ControlRow>
            )}
          </>
        )}
      </div>
    </ConfigSection>
  )
}
