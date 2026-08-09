import React, { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCheckoutState } from './hooks/useCheckoutState'
import { CheckoutScreen } from './screens/CheckoutScreen'
import { ProcessingScreen } from './screens/ProcessingScreen'
import { SuccessScreen } from './screens/SuccessScreen'
import { DeclinedScreen } from './screens/DeclinedScreen'

function DemoControls({
  hasExpressMethods,
  onSetExpressMethods,
  userMode,
  onSetUserMode,
}: {
  hasExpressMethods: boolean
  onSetExpressMethods: (v: boolean) => void
  userMode: 'new' | 'saved'
  onSetUserMode: (m: 'new' | 'saved') => void
}) {
  return (
    <div className="w-full flex justify-center py-3 bg-white border-t border-black/[0.05] flex-shrink-0">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-[0_4px_32px_rgba(0,0,0,0.10)] border border-black/[0.06] flex items-center gap-2">
        <div className="flex items-center bg-black/[0.05] rounded-xl p-0.5 gap-0.5">
          <button
            onClick={() => onSetExpressMethods(true)}
            className={`text-[11px] px-3 py-1 rounded-[10px] font-medium transition-all ${
              hasExpressMethods
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Express
          </button>
          <button
            onClick={() => onSetExpressMethods(false)}
            className={`text-[11px] px-3 py-1 rounded-[10px] font-medium transition-all ${
              !hasExpressMethods
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            No Express
          </button>
        </div>

        <div className="w-px h-4 bg-black/10" />

        <div className="flex items-center bg-black/[0.05] rounded-xl p-0.5 gap-0.5">
          <button
            onClick={() => onSetUserMode('saved')}
            className={`text-[11px] px-3 py-1 rounded-[10px] font-medium transition-all ${
              userMode === 'saved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Saved Card
          </button>
          <button
            onClick={() => onSetUserMode('new')}
            className={`text-[11px] px-3 py-1 rounded-[10px] font-medium transition-all ${
              userMode === 'new'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            New Card
          </button>
        </div>

        <div className="w-px h-4 bg-black/10" />

        <span className="text-[10px] text-gray-400 font-mono tracking-tight pr-0.5">SAVE10 · HEY02020</span>
      </div>
    </div>
  )
}

export default function App() {
  const {
    state,
    effectiveTotal,
    setScreen,
    toggleHeader,
    setPaymentMethod,
    updateCardForm,
    updateOtherForm,
    setPromoCode,
    applyPromoCode,
    clearPromo,
    setHasExpressMethods,
    setUserMode,
    selectSavedCard,
    submitPayment,
    reset,
  } = useCheckoutState()

  const [visible, setVisible] = useState(true)

  const handleClose = useCallback(() => setVisible(false), [])
  const handleOpen = useCallback(() => setVisible(true), [])

  const handleProcessingDone = useCallback(
    (result: 'success' | 'declined') => setScreen(result),
    [setScreen],
  )

  const handleReturnToGame = useCallback(() => {
    reset()
    setVisible(false)
  }, [reset])

  const handleTryAgain = useCallback(() => setScreen('checkout'), [setScreen])

  const handleUseDifferentCard = useCallback(() => {
    setScreen('checkout')
    setPaymentMethod('card')
  }, [setScreen, setPaymentMethod])

  const handleApplePay = useCallback(() => setScreen('processing'), [setScreen])
  const handlePayPal = useCallback(() => setScreen('processing'), [setScreen])
  const handleGPay = useCallback(() => setScreen('processing'), [setScreen])
  const handleOtherPay = useCallback(() => setScreen('processing'), [setScreen])

  return (
    /*
      Canvas: light gray, fills the browser at any size.
      Centers the device frame both horizontally and vertically.
      py-10 gives breathing room; if the viewport is shorter than 812px
      the page scrolls naturally so the frame is never clipped.
    */
    <div className="min-h-screen bg-[#e8eaed] flex items-center justify-center py-10">

      {/*
        Device frame: fixed 375×812px — never scales, never stretches.
        Rounded corners + shadow give it the feel of a real device.
        overflow-hidden ensures the inner content clips to the rounded frame.
        translateZ(0) makes this the containing block for the bottom sheets'
        `position: fixed`, pinning them to the frame rather than to the
        scrolling checkout content inside it.
      */}
      <div
        className="relative flex flex-col bg-white flex-shrink-0"
        style={{
          width: 375,
          height: 812,
          borderRadius: 24,
          overflow: 'hidden',
          transform: 'translateZ(0)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >

        {/* Scrollable content — fills remaining height above the demo drawer */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {!visible ? (
            <div className="h-full flex items-center justify-center">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleOpen}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors"
              >
                Open Checkout
              </motion.button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {state.screen === 'checkout' && (
                <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <CheckoutScreen
                    state={state}
                    effectiveTotal={effectiveTotal}
                    onToggleHeader={toggleHeader}
                    onClose={handleClose}
                    onSetPaymentMethod={setPaymentMethod}
                    onCardFormChange={updateCardForm}
                    onOtherFormChange={updateOtherForm}
                    onPromoChange={setPromoCode}
                    onPromoApply={applyPromoCode}
                    onPromoClear={clearPromo}
                    onSubmitNewCard={submitPayment}
                    onApplePay={handleApplePay}
                    onPayPal={handlePayPal}
                    onGPay={handleGPay}
                    onOtherPay={handleOtherPay}
                    onSelectSavedCard={selectSavedCard}
                    onSavedCardPay={() => setScreen('processing')}
                  />
                </motion.div>
              )}

              {state.screen === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <ProcessingScreen onDone={handleProcessingDone} />
                </motion.div>
              )}

              {state.screen === 'success' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <SuccessScreen effectiveTotal={effectiveTotal} onReturnToGame={handleReturnToGame} />
                </motion.div>
              )}

              {state.screen === 'declined' && (
                <motion.div key="declined" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <DeclinedScreen onTryAgain={handleTryAgain} onUseDifferentCard={handleUseDifferentCard} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Demo controls — anchored to bottom of the 812px frame */}
        <DemoControls
          hasExpressMethods={state.hasExpressMethods}
          onSetExpressMethods={setHasExpressMethods}
          userMode={state.userMode}
          onSetUserMode={setUserMode}
        />

      </div>
    </div>
  )
}
