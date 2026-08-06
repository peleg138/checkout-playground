import React from 'react'
import { Input } from '../UI/Input'
import { Checkbox } from '../UI/Checkbox'
import { Spinner } from '../UI/Spinner'
import type { CardFormData, CardFormErrors } from '../../types/checkout'
import { AllCardIcons, CardBrandIcon, detectCardBrand } from './PaymentIcons'
import { ShieldCheck } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'

interface CardFormProps {
  form: CardFormData
  errors: CardFormErrors
  effectiveTotal: number
  isPayLoading: boolean
  onChange: (field: keyof CardFormData, value: string | boolean) => void
  onSubmit: () => void
  inputClassName?: string
}

export function CardForm({
  form,
  errors,
  effectiveTotal,
  isPayLoading,
  onChange,
  onSubmit,
  inputClassName,
}: CardFormProps) {
  const brand = detectCardBrand(form.cardNumber)
  const { appearance } = useAppearance()
  const pc = appearance.primaryColor
  const br = appearance.buttonRadius

  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <span className="text-[16px] leading-6 font-semibold text-[#09090b]">
          Pay with debit or credit card
        </span>
        <div className="flex items-center gap-1">
          <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" className="flex-shrink-0" />
          <span className="text-[14px] leading-5 font-normal text-[#71717a]">
            Secure and encrypted
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3">
        {/* Card number */}
        <Input
          type="text"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={v => onChange('cardNumber', v)}
          error={errors.cardNumber}
          className={inputClassName}
          rightSlot={
            brand !== 'unknown' ? (
              <CardBrandIcon brand={brand} />
            ) : (
              <AllCardIcons />
            )
          }
        />

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="MM/YY"
            value={form.expiry}
            onChange={v => onChange('expiry', v)}
            error={errors.expiry}
            className={inputClassName}
          />
          <Input
            type="text"
            placeholder="CVC"
            value={form.cvc}
            onChange={v => onChange('cvc', v)}
            error={errors.cvc}
            className={inputClassName}
            rightSlot={
              form.cvc.replace(/\D/g, '').length >= 3 ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className="flex-shrink-0">
                  <rect x="0.5" y="0.5" width="17" height="13" rx="1.5" stroke="#9ca3af" strokeWidth="1"/>
                  <line x1="0.5" y1="3.5" x2="17.5" y2="3.5" stroke="#9ca3af" strokeWidth="1"/>
                  <rect x="2" y="6" width="4" height="2" rx="0.5" fill="#9ca3af"/>
                </svg>
              )
            }
          />
        </div>

        {/* ZIP */}
        <Input
          type="text"
          placeholder="Zip Code"
          value={form.zip}
          onChange={v => onChange('zip', v)}
          error={errors.zip}
          className={inputClassName}
          leftSlot={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="6" r="1.5" stroke="#9ca3af" strokeWidth="1.2"/>
            </svg>
          }
        />

        {/* Email */}
        <Input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={v => onChange('email', v)}
          error={errors.email}
          className={inputClassName}
          leftSlot={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#9ca3af" strokeWidth="1.2"/>
              <path d="M1.5 5l6.5 4 6.5-4" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      {/* Save card checkbox */}
      <Checkbox
        checked={form.saveCard}
        onChange={v => onChange('saveCard', v)}
        label="Save my card details for future payments"
      />

      {/* Pay button */}
      <button
        onClick={onSubmit}
        disabled={isPayLoading}
        className="w-full h-12 text-[16px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        style={{ backgroundColor: pc, borderRadius: br }}
      >
        {isPayLoading ? (
          <Spinner size={18} color="white" />
        ) : (
          `Pay $${effectiveTotal.toFixed(2)}`
        )}
      </button>

    </div>
  )
}
