import React, { useRef, useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Input } from '../UI/Input'
import { Spinner } from '../UI/Spinner'
import type { OtherPaymentFormData } from '../../types/checkout'
import { PAYMENT_METHODS } from './paymentMethodsData'

interface OtherPaymentsProps {
  form: OtherPaymentFormData
  effectiveTotal: number
  isPayLoading: boolean
  selectedMethod?: string
  /** Called when the user picks a method from the dropdown (post-first-selection) */
  onMethodSelect?: (id: string) => void
  onChange: (field: keyof OtherPaymentFormData, value: string) => void
  onPay: () => void
  /** When true, the combobox opens an inline dropdown instead of calling onOpenMethodSheet */
  useDropdown?: boolean
  // Legacy props for first-time flow
  onOpenMethodSheet?: () => void
  isSheetOpen?: boolean
}

export function OtherPayments({
  form,
  effectiveTotal,
  isPayLoading,
  selectedMethod = 'cashapp',
  onMethodSelect,
  onChange,
  onPay,
  useDropdown = false,
  onOpenMethodSheet,
  isSheetOpen = false,
}: OtherPaymentsProps) {
  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod) ?? PAYMENT_METHODS[2]
  const otherMethods = PAYMENT_METHODS.filter(m => m.id !== selectedMethod)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const handleComboClick = () => {
    if (useDropdown) {
      setDropdownOpen(o => !o)
    } else {
      onOpenMethodSheet?.()
    }
  }

  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <span className="text-[16px] leading-6 font-semibold text-[#09090b]">
          More Payment Options
        </span>
        <div className="flex items-center gap-1">
          <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" className="flex-shrink-0" />
          <span className="text-[14px] leading-5 font-normal text-[#71717a]">
            All payments are secure and encrypted
          </span>
        </div>
      </div>

      {/* Combobox + dropdown — wrapper is the positioning anchor */}
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        {/* Trigger */}
        <button
          onClick={handleComboClick}
          className="bg-white border border-[#e4e4e7] rounded-[6px] h-11 flex items-center gap-3 px-3 w-full text-left"
        >
          <div
            className="w-[35px] h-[24px] rounded-[4px] flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: method.iconBg }}
          >
            {method.comboIcon}
          </div>
          <span className="text-[14px] leading-5 font-normal text-[#0a0a0a] flex-1">{method.name}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-40 flex-shrink-0">
            <path d="M3.5 5.25L7 1.75L10.5 5.25" stroke="#09090b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 8.75L7 12.25L10.5 8.75" stroke="#09090b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dropdown panel — absolutely positioned so it floats over the inputs */}
        {useDropdown && dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 6,
              boxShadow: '0 6px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            {otherMethods.map((m, i) => (
              <button
                key={m.id}
                onClick={() => {
                  onMethodSelect?.(m.id)
                  setDropdownOpen(false)
                }}
                className="flex items-center gap-3 w-full px-3 text-left bg-white hover:bg-[#f4f4f5] active:bg-[#ebebeb] transition-colors"
                style={{
                  height: 44,
                  border: 'none',
                  borderBottom: i < otherMethods.length - 1 ? '1px solid #f4f4f5' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 35,
                    height: 24,
                    borderRadius: 4,
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: m.iconBg,
                  }}
                >
                  {m.comboIcon}
                </div>
                <span className="text-[14px] leading-5 font-normal text-[#09090b] flex-1">
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form fields — hidden when first-time sheet is open */}
      {!isSheetOpen && (
        <div className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={v => onChange('email', v)}
          />
          <Input
            type="text"
            placeholder="Billing Address"
            value={form.address}
            onChange={v => onChange('address', v)}
          />
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={v => onChange('city', v)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={v => onChange('state', v)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pay button + legal — hidden when first-time sheet is open */}
      {!isSheetOpen && (
        <>
          <button
            onClick={onPay}
            disabled={isPayLoading}
            className="w-full h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a7bd0] active:bg-[#3370c0] transition-all flex items-center justify-center"
          >
            {isPayLoading ? <Spinner size={18} color="white" /> : `Pay $${effectiveTotal.toFixed(2)}`}
          </button>

          <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
            By clicking "Pay" you indicate that you have read, understood and agree to Appcharge's{' '}
            <a href="#" className="underline text-[#71717a]">EULA</a>
            {' '}and{' '}
            <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
          </p>
        </>
      )}
    </div>
  )
}
