import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckoutHeader } from '../components/Header/CheckoutHeader'
import { ApplePayButton } from '../components/Payment/ExpressButton'
import { PromoInput } from '../components/Header/OrderSummary'
import { useAppearance } from '../playground/AppearanceContext'
import banner1Src from '../assets/icons/banner-1.png'
import { APMSTabs } from '../components/Payment/APMSTabs'
import { CardForm } from '../components/Payment/CardForm'
import { SavedCards } from '../components/Payment/SavedCards'
import { SavedCardsSheet } from '../components/Payment/SavedCardsSheet'
import { AddCardSheet } from '../components/Payment/AddCardSheet'
import { mockOrder } from '../data/mockData'
import { OtherPayments } from '../components/Payment/OtherPayments'
import { OtherPaymentSheet } from '../components/Payment/OtherPaymentSheet'
import { CheckoutFooter } from '../components/Footer/CheckoutFooter'
import { Spinner } from '../components/UI/Spinner'
import { ShieldCheck } from 'lucide-react'
import paypalExpressSrc from '../assets/icons/paypal-express.png'
import gpayExpressSrc from '../assets/icons/gpay-express.png'
import type { CheckoutState, SavedCard } from '../types/checkout'
import type { CardFormData, CardFormErrors, OtherPaymentFormData, PaymentMethod } from '../types/checkout'

interface CheckoutScreenProps {
  state: CheckoutState
  effectiveTotal: number
  enabledPaymentMethods?: string[]
  isMultiOffers?: boolean
  onToggleHeader: () => void
  onClose: () => void
  onSetPaymentMethod: (m: PaymentMethod) => void
  onCardFormChange: (field: keyof CardFormData, value: string | boolean) => void
  onOtherFormChange: (field: keyof OtherPaymentFormData, value: string) => void
  onPromoChange: (val: string) => void
  onPromoApply: () => void
  onPromoClear: () => void
  onSubmitNewCard: () => void
  onApplePay: () => void
  onPayPal: () => void
  onGPay: () => void
  onOtherPay: () => void
  onSelectSavedCard: (id: string) => void
  onSavedCardPay: () => void
}

export function CheckoutScreen({
  state,
  effectiveTotal,
  enabledPaymentMethods,
  isMultiOffers = false,
  onToggleHeader,
  onClose,
  onSetPaymentMethod,
  onCardFormChange,
  onOtherFormChange,
  onPromoChange,
  onPromoApply,
  onPromoClear,
  onSubmitNewCard,
  onApplePay,
  onPayPal,
  onGPay,
  onOtherPay,
  onSelectSavedCard,
  onSavedCardPay,
}: CheckoutScreenProps) {
  const { promo, appearance } = useAppearance()
  const [promoOpen, setPromoOpen] = useState(false)
  const [isPayLoading, setIsPayLoading] = useState(false)
  const [showOtherSheet, setShowOtherSheet] = useState(false)
  const [selectedOtherMethod, setSelectedOtherMethod] = useState('cashapp')
  const [hasSelectedOtherMethod, setHasSelectedOtherMethod] = useState(false)
  const [showSavedCardsSheet, setShowSavedCardsSheet] = useState(false)
  const [showAddCardSheet, setShowAddCardSheet] = useState(false)
  const [extraCards, setExtraCards] = useState<SavedCard[]>([])

  const allCards = [...mockOrder.savedCards, ...extraCards]

  const handleAddCard = (card: SavedCard) => {
    setExtraCards(prev => [...prev, card])
    onSelectSavedCard(card.id)
    setShowAddCardSheet(false)
  }

  const handleSubmitNewCard = () => {
    setIsPayLoading(true)
    onSubmitNewCard()
  }

  const handleApplePay = () => {
    setIsPayLoading(true)
    onApplePay()
  }

  const handlePayPal = () => {
    setIsPayLoading(true)
    onPayPal()
  }

  const handleGPay = () => {
    setIsPayLoading(true)
    onGPay()
  }

  const handleOtherPay = () => {
    setIsPayLoading(true)
    onOtherPay()
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <CheckoutHeader
        expanded={state.headerExpanded}
        onToggle={onToggleHeader}
        onClose={onClose}
        effectiveTotal={effectiveTotal}
        promoCode={state.promoCode}
        promoStatus={state.promoStatus}
        promoDiscount={state.promoDiscount}
        promoLabel={state.promoLabel}
        onPromoChange={onPromoChange}
        onPromoApply={onPromoApply}
        onPromoClear={onPromoClear}
        isMultiOffers={isMultiOffers}
      />

      {/* Body */}
      <div className="flex flex-col bg-white">
        {/* Promo Code section */}
        {promo.enabled && (appearance.showCoupon ?? true) && (
          <AnimatePresence initial={false}>
            {!promoOpen && (
              <motion.button
                key="promo-trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setPromoOpen(true)}
                className="w-full"
                style={{ padding: 0, background: 'transparent', border: 'none', borderTop: '1px solid #e5e7eb', display: 'block' }}
              >
                <img src={banner1Src} alt="Add Promo Code" className="w-full block" draggable={false} />
              </motion.button>
            )}
            {promoOpen && (
              <motion.div
                key="promo-expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-4 py-3 flex flex-col gap-3 bg-[#FAFAFA]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] leading-[18px] font-medium text-[#09090b]">Add Promo Code</span>
                    <button
                      onClick={() => { setPromoOpen(false); onPromoClear() }}
                      className="text-[12px] leading-[18px] font-medium text-[#71717a]"
                    >
                      Cancel
                    </button>
                  </div>
                  <PromoInput
                    promoCode={promoCode}
                    promoStatus={promoStatus}
                    primaryColor={appearance.primaryColor}
                    placeholder="Coupon"
                    onPromoChange={onPromoChange}
                    onPromoApply={onPromoApply}
                    onPromoClear={onPromoClear}
                  />
                </div>
                <div className="h-px bg-[#e5e7eb]" />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {state.hasExpressMethods && (
          <ApplePayButton onClick={handleApplePay} type={state.expressButtonType} />
        )}

        <APMSTabs
          selected={state.selectedPaymentMethod}
          hasExpress={state.hasExpressMethods}
          enabledMethods={state.hasExpressMethods && state.expressButtonType === 'google'
            ? enabledPaymentMethods?.filter(m => m !== 'gpay')
            : state.hasExpressMethods && state.expressButtonType === 'paypal'
            ? enabledPaymentMethods?.filter(m => m !== 'paypal')
            : enabledPaymentMethods}
          onSelect={(method) => {
            if (method === 'other') {
              onSetPaymentMethod('other')
              setShowOtherSheet(true)
            } else {
              onSetPaymentMethod(method)
            }
          }}
        />

        <AnimatePresence mode="wait">
          {state.selectedPaymentMethod === 'paypal' && (
            <motion.div
              key="paypal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pt-4 pb-4 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[16px] leading-6 font-semibold text-[#09090b]">Pay with PayPal</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" />
                  <span className="text-[14px] leading-5 font-normal text-[#71717a]">Secure and encrypted</span>
                </div>
              </div>

              <button
                onClick={handlePayPal}
                disabled={isPayLoading}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: 48, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
              >
                <div style={{ width: '100%', height: 48, borderRadius: 6, overflow: 'hidden', background: '#FFC439' }}>
                  {isPayLoading
                    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={18} color="white" /></div>
                    : <img src={paypalExpressSrc} alt="Continue with PayPal" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: 'scale(1.12)' }} draggable={false} />
                  }
                </div>
              </button>
            </motion.div>
          )}

          {state.selectedPaymentMethod === 'gpay' && (
            <motion.div
              key="gpay"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pt-4 pb-4 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[16px] leading-6 font-semibold text-[#09090b]">Pay with Google Pay</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" />
                  <span className="text-[14px] leading-5 font-normal text-[#71717a]">Secure and encrypted</span>
                </div>
              </div>

              <button
                onClick={handleGPay}
                disabled={isPayLoading}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: 48, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
              >
                <div style={{ width: '100%', height: 48, borderRadius: 6, overflow: 'hidden', background: '#000' }}>
                  {isPayLoading
                    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={18} color="white" /></div>
                    : <img src={gpayExpressSrc} alt="Pay with Google Pay" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: 'scale(1.12)' }} draggable={false} />
                  }
                </div>
              </button>
            </motion.div>
          )}

          {state.selectedPaymentMethod === 'card' && state.userMode === 'saved' && (
            <motion.div
              key="saved-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SavedCards
                cards={allCards.filter(c => c.id === state.selectedSavedCardId)}
                selectedId={state.selectedSavedCardId}
                effectiveTotal={effectiveTotal}
                isPayLoading={isPayLoading}
                onSelect={onSelectSavedCard}
                onOpenManageCards={() => setShowSavedCardsSheet(true)}
                onPay={onSavedCardPay}
              />
            </motion.div>
          )}

          {state.selectedPaymentMethod === 'card' && state.userMode === 'new' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CardForm
                form={state.cardForm}
                errors={state.cardErrors}
                effectiveTotal={effectiveTotal}
                isPayLoading={isPayLoading}
                onChange={onCardFormChange}
                onSubmit={handleSubmitNewCard}
              />
            </motion.div>
          )}

          {state.selectedPaymentMethod === 'other' && (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OtherPayments
                form={state.otherForm}
                effectiveTotal={effectiveTotal}
                isPayLoading={isPayLoading}
                selectedMethod={selectedOtherMethod}
                onOpenMethodSheet={() => setShowOtherSheet(true)}
                useDropdown={hasSelectedOtherMethod}
                onMethodSelect={(id) => setSelectedOtherMethod(id)}
                onChange={onOtherFormChange}
                onPay={handleOtherPay}
                isSheetOpen={showOtherSheet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!showOtherSheet && <CheckoutFooter />}

      <SavedCardsSheet
        isOpen={showSavedCardsSheet}
        cards={allCards}
        selectedId={state.selectedSavedCardId}
        onClose={() => setShowSavedCardsSheet(false)}
        onSelect={(id) => { onSelectSavedCard(id); setShowSavedCardsSheet(false) }}
        onAddNewCard={() => { setShowSavedCardsSheet(false); setShowAddCardSheet(true) }}
      />

      <AddCardSheet
        isOpen={showAddCardSheet}
        effectiveTotal={effectiveTotal}
        onClose={() => setShowAddCardSheet(false)}
        onAdd={handleAddCard}
      />

      <OtherPaymentSheet
        isOpen={showOtherSheet}
        selectedMethod={selectedOtherMethod}
        onClose={() => setShowOtherSheet(false)}
        onSelect={(id) => {
          setSelectedOtherMethod(id)
          setHasSelectedOtherMethod(true)
          setShowOtherSheet(false)
        }}
      />
    </div>
  )
}
