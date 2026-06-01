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
            All payments are secure and encrypted
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3">
        {/* Email */}
        <Input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={v => onChange('email', v)}
          error={errors.email}
          className={inputClassName}
        />

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
          />
        </div>

        {/* ZIP */}
        <Input
          type="text"
          placeholder="ZIP / Postal code"
          value={form.zip}
          onChange={v => onChange('zip', v)}
          error={errors.zip}
          className={inputClassName}
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
        className="w-full h-11 text-[14px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        style={{ backgroundColor: pc, borderRadius: br }}
      >
        {isPayLoading ? (
          <Spinner size={18} color="white" />
        ) : (
          `Pay $${effectiveTotal.toFixed(2)}`
        )}
      </button>

      {/* Legal text */}
      <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
        By clicking "Pay" you indicate that you have read, understood and agree to Appcharge's{' '}
        <a href="#" className="underline text-[#71717a]">EULA</a>
        {' '}and{' '}
        <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
      </p>
    </div>
  )
}
