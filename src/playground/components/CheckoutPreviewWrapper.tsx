import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCheckoutState } from '../../hooks/useCheckoutState'
import { CheckoutScreen } from '../../screens/CheckoutScreen'
import { DesktopCheckoutScreen } from '../../screens/DesktopCheckoutScreen'
import { ProcessingScreen } from '../../screens/ProcessingScreen'
import { SuccessScreen } from '../../screens/SuccessScreen'
import { DeclinedScreen } from '../../screens/DeclinedScreen'
import { AppearanceContext } from '../AppearanceContext'
import type { PlaygroundConfig } from '../types'

// ── Portrait frame: 375 × 812 internal, scaled to 85% ──────────────────────
const PT_INNER_W = 375
const PT_INNER_H = 812
const PT_SCALE   = 0.85
const PT_OUTER_W = Math.round(PT_INNER_W * PT_SCALE)  // 319
const PT_OUTER_H = Math.round(PT_INNER_H * PT_SCALE)  // 690
const PT_RADIUS  = Math.round(24 * PT_SCALE)           // 20

// ── Landscape frame: 812 × 375 internal, scaled to 85% ─────────────────────
const LS_INNER_W = 812
const LS_INNER_H = 375
const LS_SCALE   = 0.85
const LS_OUTER_W = Math.round(LS_INNER_W * LS_SCALE)  // 690
const LS_OUTER_H = Math.round(LS_INNER_H * LS_SCALE)  // 319
const LS_RADIUS  = Math.round(24 * LS_SCALE)           // 20

// ── Desktop frame: 976 × 871 internal, scaled to 75% ───────────────────────
const DS_INNER_W = 976
const DS_INNER_H = 871
const DS_SCALE   = 0.75
const DS_OUTER_W = Math.round(DS_INNER_W * DS_SCALE)  // 720
const DS_OUTER_H = Math.round(DS_INNER_H * DS_SCALE)  // 653
const DS_RADIUS  = Math.round(12 * DS_SCALE)           // 9

interface Props {
  config: PlaygroundConfig
  orientation?: 'portrait' | 'landscape' | 'desktop'
  isMultiOffers?: boolean
}

export function CheckoutPreviewWrapper({ config, orientation = 'portrait', isMultiOffers = false }: Props) {
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
    setExpressButtonType,
    setUserMode,
    selectSavedCard,
    submitPayment,
    reset,
  } = useCheckoutState(config.promo.validCodes, !isMultiOffers)

  const [visible, setVisible] = useState(true)

  // Sync playground config → checkout state
  useEffect(() => {
    setHasExpressMethods(config.checkoutMode.hasExpressMethods)
  }, [config.checkoutMode.hasExpressMethods, setHasExpressMethods])

  useEffect(() => {
    setUserMode(config.checkoutMode.userMode)
  }, [config.checkoutMode.userMode, setUserMode])

  useEffect(() => {
    setExpressButtonType(config.checkoutMode.expressButtonType)
  }, [config.checkoutMode.expressButtonType, setExpressButtonType])

  // Auto-switch APM if currently selected method becomes disabled
  useEffect(() => {
    const enabled = config.paymentMethods.filter(m => m.enabled).sort((a, b) => a.order - b.order)
    if (enabled.length === 0) return
    const isCurrentEnabled = enabled.some(m => m.id === state.selectedPaymentMethod)
    if (!isCurrentEnabled) {
      setPaymentMethod(enabled[0].id as any)
    }
  }, [config.paymentMethods, state.selectedPaymentMethod, setPaymentMethod])

  const handleClose = useCallback(() => setVisible(false), [])
  const handleOpen = useCallback(() => setVisible(true), [])
  const handleProcessingDone = useCallback((result: 'success' | 'declined') => setScreen(result), [setScreen])
  const handleReturnToGame = useCallback(() => { reset(); setVisible(false) }, [reset])
  const handleTryAgain = useCallback(() => setScreen('checkout'), [setScreen])
  const handleUseDifferentCard = useCallback(() => { setScreen('checkout'); setPaymentMethod('card') }, [setScreen, setPaymentMethod])
  const handleApplePay = useCallback(() => setScreen('processing'), [setScreen])
  const handlePayPal = useCallback(() => setScreen('processing'), [setScreen])
  const handleGPay = useCallback(() => setScreen('processing'), [setScreen])
  const handleOtherPay = useCallback(() => setScreen('processing'), [setScreen])

  // Filter enabled payment methods for the APMs tabs
  const enabledMethods = config.paymentMethods
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order)
    .map(m => m.id)

  const isLandscape = orientation === 'landscape'
  const isDesktop = orientation === 'desktop'
  const isDesktopLayout = isLandscape || isDesktop  // both use DesktopCheckoutScreen

  // Shared inner screens (used in both orientations)
  const checkoutNode = isDesktopLayout ? (
    <DesktopCheckoutScreen
      state={state}
      effectiveTotal={effectiveTotal}
      enabledPaymentMethods={enabledMethods}
      isDesktop={isDesktop}
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
  ) : (
    <CheckoutScreen
      state={state}
      effectiveTotal={effectiveTotal}
      enabledPaymentMethods={enabledMethods}
      isMultiOffers={isMultiOffers}
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
  )

  const innerW = isDesktop ? DS_INNER_W : isLandscape ? LS_INNER_W : PT_INNER_W
  const innerH = isDesktop ? DS_INNER_H : isLandscape ? LS_INNER_H : PT_INNER_H
  const outerW = isDesktop ? DS_OUTER_W : isLandscape ? LS_OUTER_W : PT_OUTER_W
  const outerH = isDesktop ? DS_OUTER_H : isLandscape ? LS_OUTER_H : PT_OUTER_H
  const radius = isDesktop ? DS_RADIUS  : isLandscape ? LS_RADIUS  : PT_RADIUS
  const scale  = isDesktop ? DS_SCALE   : isLandscape ? LS_SCALE   : PT_SCALE

  return (
    <AppearanceContext.Provider
      value={{
        appearance: config.appearance,
        background: config.background,
        products: config.products,
        promo: config.promo,
        showProductImages: config.products.showProductImages,
      }}
    >
      {/*
        Device frame: renders at fixed internal dimensions, scaled down for display.
        Portrait  → 375×812 internal, 85% scale → 319×690 outer
        Landscape → 812×375 internal, 85% scale → 690×319 outer
      */}
      <div
        className="flex-shrink-0"
        style={{
          width: outerW,
          height: outerH,
          borderRadius: radius,
          overflow: 'hidden',
          isolation: 'isolate',
          boxShadow: isDesktop
            ? '0 40px 100px rgba(0,0,0,0.24), 0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)'
            : isLandscape
            ? '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)'
            : '0 24px 60px rgba(0,0,0,0.20), 0 6px 18px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.06)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Inner: full internal dimensions, scaled down from top-left */}
        <div
          style={{
            width: innerW,
            height: innerH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <div
            className="scrollbar-hide"
            style={{
              height: innerH,
              overflow: isDesktopLayout ? 'hidden' : 'auto',
              overflowX: 'hidden',
              overflowY: isDesktopLayout ? 'hidden' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
              position: 'relative',
            }}
          >
            {!visible ? (
              <div className="h-full flex items-center justify-center bg-white">
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
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={isDesktopLayout ? { height: '100%' } : undefined}>
                    {checkoutNode}
                  </motion.div>
                )}
                {state.screen === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ProcessingScreen onDone={handleProcessingDone} />
                  </motion.div>
                )}
                {state.screen === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SuccessScreen effectiveTotal={effectiveTotal} onReturnToGame={handleReturnToGame} isDesktop={isDesktop} />
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
        </div>
      </div>
    </AppearanceContext.Provider>
  )
}
