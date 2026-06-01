import React from 'react'
import { CreditCard } from 'lucide-react'
import type { PaymentMethod } from '../../types/checkout'
import paypalSrc from '../../assets/icons/apms-paypal.svg'
import gpaySrc from '../../assets/icons/apms-gpay.svg'
import otherSrc from '../../assets/icons/apms-other.svg'
import { useAppearance } from '../../playground/AppearanceContext'

function DotsGrid3x2() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor" className="flex-shrink-0">
      {[3, 9].flatMap(cy => [2.5, 7.5, 12.5].map(cx => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.5} />
      )))}
    </svg>
  )
}

interface APMSTabsProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  hasExpress?: boolean
  enabledMethods?: string[]
}

export function APMSTabs({ selected, onSelect, hasExpress, enabledMethods }: APMSTabsProps) {
  const { appearance } = useAppearance()
  const pc = appearance.primaryColor

  const tabClass = (active: boolean) => [
    'h-14 w-full min-w-0 rounded-[6px] flex items-center justify-center px-2 py-2 transition-all overflow-hidden',
    active
      ? 'border border-[var(--apm-border)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)]'
      : 'bg-white border border-[#e4e4e7]',
  ].join(' ')

  const imgTabClass = (active: boolean) => [
    'h-14 w-full min-w-0 rounded-[6px] overflow-hidden transition-all p-0 border',
    active
      ? 'border-[var(--apm-border)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)]'
      : 'border-[#e4e4e7]',
  ].join(' ')

  const ALL_TABS = [
    { id: 'card' as PaymentMethod },
    { id: 'paypal' as PaymentMethod },
    { id: 'gpay' as PaymentMethod },
    { id: 'other' as PaymentMethod },
  ]

  // Preserve the order from enabledMethods (which reflects drag-and-drop order)
  const visibleTabs = enabledMethods
    ? enabledMethods
        .map(id => ALL_TABS.find(t => t.id === id))
        .filter(Boolean) as typeof ALL_TABS
    : ALL_TABS

  const cols = visibleTabs.length

  return (
    <div
      className={`px-4 ${hasExpress ? 'pt-2' : 'pt-4'} pb-0`}
      style={{ '--apm-border': pc, '--apm-bg': `${pc}18` } as React.CSSProperties}
    >
      <div className="gap-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {visibleTabs.map(tab => {
          const active = selected === tab.id
          if (tab.id === 'card') {
            return (
              <button
                key="card"
                onClick={() => onSelect('card')}
                className={tabClass(active)}
                style={active ? { backgroundColor: `${pc}18` } : {}}
              >
                <div className="flex items-center justify-center gap-[3px]">
                  <CreditCard size={18} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="text-[12px] font-normal text-black leading-none">Card</span>
                </div>
              </button>
            )
          }
          if (tab.id === 'paypal') {
            return (
              <button key="paypal" onClick={() => onSelect('paypal')} className={imgTabClass(active)} style={active ? { backgroundColor: `${pc}18` } : {}}>
                <img src={paypalSrc} alt="PayPal" className={`w-full h-full object-fill${active ? ' mix-blend-multiply' : ''}`} draggable={false} />
              </button>
            )
          }
          if (tab.id === 'gpay') {
            return (
              <button key="gpay" onClick={() => onSelect('gpay')} className={imgTabClass(active)} style={active ? { backgroundColor: `${pc}18` } : {}}>
                <img src={gpaySrc} alt="Google Pay" className={`w-full h-full object-fill${active ? ' mix-blend-multiply' : ''}`} draggable={false} />
              </button>
            )
          }
          return (
            <button key="other" onClick={() => onSelect('other')} className={imgTabClass(active)} style={active ? { backgroundColor: `${pc}18` } : {}}>
              <img src={otherSrc} alt="Other" className={`w-full h-full object-fill${active ? ' mix-blend-multiply' : ''}`} draggable={false} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
