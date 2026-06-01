import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckoutHeader } from '../components/Header/CheckoutHeader'
import { ApplePayButton } from '../components/Payment/ExpressButton'
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
import type { CheckoutState, SavedCard } from '../types/checkout'
import type { CardFormData, CardFormErrors, OtherPaymentFormData, PaymentMethod } from '../types/checkout'

interface CheckoutScreenProps {
  state: CheckoutState
  effectiveTotal: number
  enabledPaymentMethods?: string[]
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
      />

      {/* Body */}
      <div className="flex flex-col bg-white">
        {state.hasExpressMethods && (
          <ApplePayButton onClick={handleApplePay} type={state.expressButtonType} />
        )}

        <APMSTabs
          selected={state.selectedPaymentMethod}
          hasExpress={state.hasExpressMethods}
          enabledMethods={enabledPaymentMethods}
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
                  <span className="text-[14px] leading-5 font-normal text-[#71717a]">All payments are secure and encrypted</span>
                </div>
              </div>
              <p className="text-[14px] leading-5 font-normal text-[#71717a]">You'll be redirected to PayPal to complete your payment securely.</p>
              <button
                onClick={handlePayPal}
                disabled={isPayLoading}
                className="w-full h-11 rounded-[6px] bg-[#003087] text-[14px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#002069] transition-all flex items-center justify-center"
              >
                {isPayLoading ? <Spinner size={18} color="white" /> : 'Continue with PayPal'}
              </button>
              <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
                By clicking "Continue" you agree to Appcharge's{' '}
                <a href="#" className="underline text-[#71717a]">EULA</a>{' '}and{' '}
                <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
              </p>
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
                  <span className="text-[14px] leading-5 font-normal text-[#71717a]">All payments are secure and encrypted</span>
                </div>
              </div>
              <p className="text-[14px] leading-5 font-normal text-[#71717a]">Complete your purchase quickly with Google Pay.</p>
              <button
                onClick={handleGPay}
                disabled={isPayLoading}
                className="w-full h-11 rounded-[6px] bg-white border border-[#e4e4e7] text-[14px] leading-5 font-medium text-[#09090b] px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                {isPayLoading ? <Spinner size={18} color="gray" /> : 'Pay with Google Pay'}
              </button>
              <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
                By clicking "Pay" you agree to Appcharge's{' '}
                <a href="#" className="underline text-[#71717a]">EULA</a>{' '}and{' '}
                <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
              </p>
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
