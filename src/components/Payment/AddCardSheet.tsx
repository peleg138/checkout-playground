import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSheetScrollLock } from '../../hooks/useSheetScrollLock'
import { ShieldCheck } from 'lucide-react'
import { Input } from '../UI/Input'
import { Checkbox } from '../UI/Checkbox'
import { AllCardIcons, CardBrandIcon, detectCardBrand } from './PaymentIcons'
import type { SavedCard } from '../../types/checkout'

interface AddCardSheetProps {
  isOpen: boolean
  effectiveTotal: number
  onClose: () => void
  onAdd: (card: SavedCard) => void
}

export function AddCardSheet({ isOpen, effectiveTotal, onClose, onAdd }: AddCardSheetProps) {
  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [zip, setZip] = useState('')
  const [saveCard, setSaveCard] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useSheetScrollLock(isOpen, overlayRef)

  const brand = detectCardBrand(cardNumber)

  const reset = () => {
    setEmail(''); setCardNumber(''); setExpiry(''); setCvc(''); setZip(''); setSaveCard(true)
  }

  const handleClose = () => { reset(); onClose() }

  const handlePay = () => {
    const digits = cardNumber.replace(/\s/g, '')
    const last4 = digits.slice(-4) || '0000'
    const detectedBrand = brand === 'unknown' ? 'visa' : brand
    const newCard: SavedCard = {
      id: `new-${Date.now()}`,
      last4,
      brand: detectedBrand,
      expiry,
      requiresCvc: false,
    }
    onAdd(newCard)
    reset()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={overlayRef} className="fixed inset-0 z-[70] pointer-events-none flex flex-col justify-end">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={handleClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="relative bg-white w-full pointer-events-auto flex flex-col rounded-t-[16px]"
            style={{ maxHeight: '90dvh', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-[10px] pb-[6px] flex-shrink-0">
              <div className="w-[36px] h-[4px] rounded-full bg-[#d1d5db]" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
              {/* Header */}
              <div className="flex flex-col gap-1 mb-4">
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

              {/* Fields */}
              <div className="flex flex-col gap-3">
                <Input type="email" placeholder="Email Address" value={email} onChange={setEmail} />

                <Input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={v => {
                    const d = v.replace(/\D/g, '').slice(0, 16)
                    setCardNumber(d.replace(/(\d{4})(?=\d)/g, '$1 '))
                  }}
                  rightSlot={brand !== 'unknown' ? <CardBrandIcon brand={brand} /> : <AllCardIcons />}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={v => {
                      const d = v.replace(/\D/g, '').slice(0, 4)
                      setExpiry(d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d)
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="CVC"
                    value={cvc}
                    onChange={v => setCvc(v.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>

                <Input
                  type="text"
                  placeholder="ZIP / Postal code"
                  value={zip}
                  onChange={v => setZip(v.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10))}
                />
              </div>

              <div className="mt-3">
                <Checkbox
                  checked={saveCard}
                  onChange={setSaveCard}
                  label="Save my card details for future payments"
                />
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="px-4 pt-4 pb-6 flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handlePay}
                className="w-full h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white flex items-center justify-center hover:bg-[#3a7bd0] active:bg-[#3370c0] transition-all"
              >
                Pay ${effectiveTotal.toFixed(2)}
              </button>
              <button
                onClick={handleClose}
                className="w-full h-11 rounded-[6px] border border-[#e4e4e7] bg-white text-[14px] leading-5 font-medium text-[#09090b] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
