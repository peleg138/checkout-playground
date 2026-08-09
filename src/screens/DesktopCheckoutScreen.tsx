import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShieldCheck, ArrowLeft } from 'lucide-react'
import { OrderSummary } from '../components/Header/OrderSummary'
import { MultiOfferList } from '../components/Header/MultiOfferList'
import { MultiOfferBox } from '../components/Header/MultiOfferBox'
import { ApplePayButton } from '../components/Payment/ExpressButton'
import { APMSTabs } from '../components/Payment/APMSTabs'
import { CardForm } from '../components/Payment/CardForm'
import { SavedCards } from '../components/Payment/SavedCards'
import { SavedCardsSheet, AddNewCardRow, SheetCardRow } from '../components/Payment/SavedCardsSheet'
import { Input } from '../components/UI/Input'
import { Checkbox } from '../components/UI/Checkbox'
import { AllCardIcons, CardBrandIcon, detectCardBrand } from '../components/Payment/PaymentIcons'
import { OtherPayments } from '../components/Payment/OtherPayments'
import { CheckoutFooter } from '../components/Footer/CheckoutFooter'
import { Spinner } from '../components/UI/Spinner'
import { PAYMENT_METHODS } from '../components/Payment/paymentMethodsData'
import { mockOrder } from '../data/mockData'
import applePaySrc from '../assets/icons/express.png'
import googlePaySrc from '../assets/icons/express-gpay.png'
import expressPaypalSrc from '../assets/icons/express-paypal.png'
import logoSrc from '../assets/icons/logo.png'
import shoppingCartSrc from '../assets/icons/ShoppingCart.png'
import desktopFooterSrc from '../assets/icons/footer-desktop.png'
import landscapeFooterSrc from '../assets/icons/footer-landscape.png'
import circleCheck from '../assets/icons/circle-check.png'
import { useAppearance } from '../playground/AppearanceContext'
import type { CheckoutState, SavedCard, CardFormData, OtherPaymentFormData, PaymentMethod } from '../types/checkout'

interface DesktopCheckoutScreenProps {
  state: CheckoutState
  effectiveTotal: number
  enabledPaymentMethods?: string[]
  isDesktop?: boolean
  isMultiOffers?: boolean
  onToggleHeader?: () => void
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

export function DesktopCheckoutScreen({
  state,
  effectiveTotal,
  enabledPaymentMethods,
  isDesktop = false,
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
}: DesktopCheckoutScreenProps) {
  const { background, products, appearance } = useAppearance()
  const pc = appearance.primaryColor
  const br = appearance.buttonRadius
  const EXPRESS_ASSETS_MAP = {
    apple:  { src: applePaySrc,      label: 'Pay with Apple Pay',  bg: '#000000' },
    google: { src: googlePaySrc,     label: 'Pay with Google Pay', bg: '#000000' },
    paypal: { src: expressPaypalSrc, label: 'Pay with PayPal',     bg: '#FFC439' },
  }
  const hasBg = !!background.imageUrl && background.backgroundType !== 'white'
  // Desktop mirrors the portrait checkout: the collapsible offers box. Landscape has no
  // room to collapse, so it shows the bare list instead.
  const showMultiOfferBox = isMultiOffers && isDesktop
  const showMultiOfferList = isMultiOffers && !isDesktop

  const [isPayLoading, setIsPayLoading] = useState(false)
  const [showOtherMethodPicker, setShowOtherMethodPicker] = useState(false)
  const [selectedOtherMethod, setSelectedOtherMethod] = useState('cashapp')
  const [hasSelectedOtherMethod, setHasSelectedOtherMethod] = useState(false)
  const [showSavedCardsSheet, setShowSavedCardsSheet] = useState(false)
  const [showAddCardSheet, setShowAddCardSheet] = useState(false)
  const [extraCards, setExtraCards] = useState<SavedCard[]>([])

  // Inline saved-cards picker state (landscape/desktop replaces the bottom sheet)
  const [pickerLocalCards, setPickerLocalCards] = useState<SavedCard[]>([])
  const [pickerPendingId, setPickerPendingId] = useState<string | null>(null)
  const [pickerOpenMenuId, setPickerOpenMenuId] = useState<string | null>(null)

  // Inline add-card form state
  const [addEmail, setAddEmail] = useState('')
  const [addCardNumber, setAddCardNumber] = useState('')
  const [addExpiry, setAddExpiry] = useState('')
  const [addCvc, setAddCvc] = useState('')
  const [addZip, setAddZip] = useState('')
  const [addSaveCard, setAddSaveCard] = useState(true)
  const addBrand = detectCardBrand(addCardNumber)
  const resetAddForm = () => { setAddEmail(''); setAddCardNumber(''); setAddExpiry(''); setAddCvc(''); setAddZip(''); setAddSaveCard(true) }

  const allCards = [...mockOrder.savedCards, ...extraCards]

  const handleAddCard = (card: SavedCard) => {
    setExtraCards(prev => [...prev, card])
    onSelectSavedCard(card.id)
    setShowAddCardSheet(false)
    resetAddForm()
  }

  const handleSubmitNewCard = () => { setIsPayLoading(true); onSubmitNewCard() }
  const handleApplePay    = () => { setIsPayLoading(true); onApplePay() }
  const handlePayPal      = () => { setIsPayLoading(true); onPayPal() }
  const handleGPay        = () => { setIsPayLoading(true); onGPay() }
  const handleOtherPay    = () => { setIsPayLoading(true); onOtherPay() }

  return (
    <div className="flex flex-row relative bg-white" style={{ height: '100%', overflow: 'hidden' }}>

      {/* ── Desktop-only: close button absolutely in top-right corner ── */}
      {isDesktop && (
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center z-10"
          aria-label="Close"
          style={{ top: 16, right: 16 }}
        >
          <X size={15} strokeWidth={2} color="#09090b" />
        </button>
      )}

      {/* ── LEFT: Order Summary (43%) ─────────────────────────────── */}
      <div className="w-[43%] flex-shrink-0 border-r border-[#eaebec] overflow-hidden" style={{ height: '100%' }}>
        {/* tf wrapper — matches prototype: relative pl-12 pr-6 overflow-hidden */}
        <div className="relative pl-12 pr-6 overflow-hidden h-full">
          {/* Background layer */}
          {hasBg ? (
            <>
              <div
                className="absolute inset-x-0 top-0"
                style={{
                  height: '100%',
                  backgroundImage: `url(${background.imageUrl})`,
                  backgroundSize: background.fit,
                  backgroundPosition: background.position,
                  opacity: background.opacity / 100,
                  filter: background.blur > 0 ? `blur(${background.blur}px)` : undefined,
                }}
              />
              {background.overlay > 0 && (
                <div
                  className="absolute inset-x-0 top-0"
                  style={{ height: '100%', background: 'black', opacity: background.overlay / 100 }}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-white" />
          )}

          {/* Content sits above the background */}
          <div className={`relative ${isDesktop ? 'pt-12' : 'pt-4'}`}>
            {/* Logo + offer title */}
            <div className={`flex items-center gap-2 ${showMultiOfferList ? 'pb-1.5' : 'pb-3'}`}>
              <img
                src={products.gameLogo || logoSrc}
                alt={products.gameName || 'Game'}
                className={`${isDesktop ? 'w-[52px] h-[52px]' : 'w-11 h-11'} rounded-[4.4px] flex-shrink-0 object-cover`}
                draggable={false}
              />
              {showMultiOfferList ? (
                /* Landscape multi offers: the offer count replaces the single-offer title, right-aligned. */
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <img
                    src={shoppingCartSrc}
                    alt=""
                    width={isDesktop ? 18 : 16}
                    height={isDesktop ? 18 : 16}
                    draggable={false}
                    style={{ filter: hasBg ? 'brightness(0) invert(1)' : 'none' }}
                  />
                  <span className={`${isDesktop ? 'text-[16px] leading-6' : 'text-[14px] leading-5'} font-semibold ${hasBg ? 'text-white' : 'text-black'}`}>
                    {products.multiOffers?.length ?? 0} Offers
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className={`${isDesktop ? 'text-[16px]' : 'text-[14px]'} leading-6 font-semibold ${hasBg ? 'text-white' : 'text-black'}`}>
                    {products.offerTitle || mockOrder.offer.title}
                  </span>
                </div>
              )}
            </div>

            {/* Multi offers: the scroll window is the whole affordance here — there is no
                collapsed state to expand into, unlike the portrait header. */}
            {/* No bottom margin on the panel: OrderSummary's own pt-3 separates it from the promo row. */}
            {showMultiOfferList && (
              <div style={{ background: hasBg ? 'rgba(0,0,0,0.10)' : '#f4f4f5', borderRadius: 8 }}>
                <MultiOfferList hasBg={hasBg} maxHeight={112} compact />
              </div>
            )}

            {showMultiOfferBox && (
              <MultiOfferBox expanded={state.headerExpanded} onToggle={onToggleHeader ?? (() => {})} hasBg={hasBg} maxHeight={340} isDesktop />
            )}

            {/* Items + promo + pricing — px-0 so content aligns with the pl-12 wrapper (no double indent) */}
            <OrderSummary
              paddingClass="px-0"
              isDesktop={isDesktop}
              isLandscape={!isDesktop}
              isMultiOffers={isMultiOffers}
              showPromoImages
              promoCode={state.promoCode}
              promoStatus={state.promoStatus}
              promoDiscount={state.promoDiscount}
              promoLabel={state.promoLabel}
              effectiveTotal={effectiveTotal}
              onPromoChange={onPromoChange}
              onPromoApply={onPromoApply}
              onPromoClear={onPromoClear}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Payment Form ──────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col h-full ${(showOtherMethodPicker || showSavedCardsSheet || showAddCardSheet) ? (isDesktop ? 'px-[96px] pt-10 overflow-hidden' : 'pt-4 overflow-hidden') : isDesktop ? 'px-[72px] pt-10 overflow-hidden' : 'pl-2 pr-8 pt-4 overflow-y-auto scrollbar-hide'}`}>

        {/* Close button — landscape only (desktop uses absolute-positioned button above) */}
        {!isDesktop && (
          <div className={`${(showOtherMethodPicker || showSavedCardsSheet || showAddCardSheet) ? 'h-4 pl-6 pr-12' : 'h-9 px-4'} pt-1 flex items-start justify-end flex-shrink-0`}>
            <button onClick={onClose} className="flex items-center justify-center" aria-label="Close">
              <X size={15} strokeWidth={2} color="#09090b" />
            </button>
          </div>
        )}

        {showOtherMethodPicker ? (
          /* ── Inline other-method selector (a5 equivalent) ── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Back + title */}
            <div className={`flex items-center gap-3 ${isDesktop ? 'pt-6 ' : 'pl-6 pr-12 pt-6 '}pb-3 flex-shrink-0`}>
              <button
                onClick={() => { setShowOtherMethodPicker(false); onSetPaymentMethod('card') }}
                className="flex items-center justify-center text-[#09090b]"
                aria-label="Back"
              >
                <ArrowLeft size={20} strokeWidth={2} color="#09090b" />
              </button>
              <span className="text-[16px] leading-6 font-semibold text-[#09090b]">
                Pay with debit or credit card
              </span>
            </div>

            {/* Method list */}
            <div className={`${isDesktop ? '' : 'flex-1 '}overflow-y-auto scrollbar-hide`}>
              <div className={`${isDesktop ? '' : 'pl-6 pr-12 '}flex flex-col gap-2 pb-6`}>
                {PAYMENT_METHODS.map(method => {
                  const isSelected = selectedOtherMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => { setSelectedOtherMethod(method.id); setHasSelectedOtherMethod(true); setShowOtherMethodPicker(false) }}
                      className={[
                        'flex items-center w-full h-14 px-3 gap-3 rounded-[8px] border transition-colors',
                        isSelected ? 'border-[#448ae3] bg-white' : 'border-[#e5e5e5] bg-white',
                      ].join(' ')}
                    >
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                          background: method.iconBg,
                          boxShadow: method.iconBg === 'transparent' ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.07)',
                        }}
                      >
                        {method.icon}
                      </div>
                      <span className="flex-1 text-[14px] leading-5 font-normal text-[#09090b] text-left">
                        {method.name}
                      </span>
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        {isSelected && <img src={circleCheck} alt="" width={18} height={18} draggable={false} />}
                      </div>
                    </button>
                  )
                })}
              </div>
              {!isDesktop && <CheckoutFooter />}
            </div>
            {isDesktop && (
              <div className="-mx-[96px] mt-auto">
                <img src={desktopFooterSrc} alt="Footer" className="w-full block" draggable={false} />
              </div>
            )}
          </div>
        ) : showSavedCardsSheet ? (
          /* ── Inline saved-cards picker (landscape/desktop) ── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Back + title */}
            <div className={`flex items-center gap-3 ${isDesktop ? 'pt-6 ' : 'pl-6 pr-12 pt-6 '}pb-3 flex-shrink-0`}>
              <button
                onClick={() => setShowSavedCardsSheet(false)}
                className="flex items-center justify-center text-[#09090b]"
                aria-label="Back"
              >
                <ArrowLeft size={20} strokeWidth={2} color="#09090b" />
              </button>
              <span className="text-[16px] leading-6 font-semibold text-[#09090b]">Saved Cards</span>
            </div>

            {/* Scrollable card list + select button + footer */}
            <div className={`${isDesktop ? '' : 'flex-1 '}overflow-y-auto scrollbar-hide`}>
              <div className={`${isDesktop ? '' : 'pl-6 pr-12 '}flex flex-col gap-2 pb-6`}>
                {/* Max-5 info box */}
                {pickerLocalCards.length >= 5 && (
                  <div className="flex items-start gap-3 bg-[#eff6ff] rounded-[8px] px-3 py-3 mb-2">
                    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
                      <circle cx="9" cy="9" r="8" stroke="#09090b" strokeWidth="1.5" />
                      <line x1="9" y1="8" x2="9" y2="13" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9" cy="5.5" r="0.75" fill="#09090b" />
                    </svg>
                    <span className="text-[13px] leading-5 font-normal text-[#09090b]">
                      You've reached the maximum of 5 saved cards. Remove a card to add a new one.
                    </span>
                  </div>
                )}
                {/* Add New Card row */}
                {pickerLocalCards.length < 5 && (
                  <AddNewCardRow onClick={() => { setShowSavedCardsSheet(false); setShowAddCardSheet(true) }} />
                )}
                {/* Menu backdrop */}
                {pickerOpenMenuId && (
                  <div className="absolute inset-0 z-10" onClick={() => setPickerOpenMenuId(null)} />
                )}
                {/* Card rows */}
                {pickerLocalCards.map(card => (
                  <SheetCardRow
                    key={card.id}
                    card={card}
                    selected={pickerPendingId === card.id}
                    onSelect={() => { setPickerPendingId(card.id); setPickerOpenMenuId(null) }}
                    menuOpen={pickerOpenMenuId === card.id}
                    onOpenMenu={e => { e.stopPropagation(); setPickerOpenMenuId(id => id === card.id ? null : card.id) }}
                    onDelete={() => {
                      setPickerLocalCards(prev => prev.filter(c => c.id !== card.id))
                      if (pickerPendingId === card.id) setPickerPendingId(pickerLocalCards.find(c => c.id !== card.id)?.id ?? null)
                      setPickerOpenMenuId(null)
                    }}
                  />
                ))}

                {/* Select button — inside scroll, below card list */}
                <button
                  onClick={() => {
                    if (pickerPendingId) onSelectSavedCard(pickerPendingId)
                    setShowSavedCardsSheet(false)
                  }}
                  className="w-full h-11 rounded-[6px] bg-[#09090b] text-[14px] leading-5 font-medium text-white flex items-center justify-center mt-2"
                >
                  Select
                </button>
              </div>
              {!isDesktop && <CheckoutFooter />}
            </div>
            {isDesktop && (
              <div className="-mx-[96px] mt-auto">
                <img src={desktopFooterSrc} alt="Footer" className="w-full block" draggable={false} />
              </div>
            )}
          </div>
        ) : showAddCardSheet ? (
          /* ── Inline add-card panel (landscape/desktop) ── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Back + title */}
            <div className={`flex items-center gap-3 ${isDesktop ? 'pt-6 ' : 'pl-6 pr-12 pt-6 '}pb-3 flex-shrink-0`}>
              <button
                onClick={() => { resetAddForm(); setShowAddCardSheet(false); setShowSavedCardsSheet(true); setPickerLocalCards(allCards); setPickerPendingId(state.selectedSavedCardId); setPickerOpenMenuId(null) }}
                className="flex items-center justify-center text-[#09090b]"
                aria-label="Back"
              >
                <ArrowLeft size={20} strokeWidth={2} color="#09090b" />
              </button>
              <span className="text-[16px] leading-6 font-semibold text-[#09090b]">Pay with debit or credit card</span>
            </div>

            {/* Scrollable form */}
            <div className={`${isDesktop ? '' : 'flex-1 '}overflow-y-auto scrollbar-hide`}>
              <div className={`${isDesktop ? '' : 'pl-6 pr-12 '}flex flex-col gap-3 pb-6`}>
                {/* Shield subtitle */}
                <div className="flex items-center gap-1 mb-1">
                  <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" className="flex-shrink-0" />
                  <span className="text-[14px] leading-5 font-normal text-[#71717a]">Secure and encrypted</span>
                </div>

                {/* Fields */}
                <Input type="email" placeholder="Email Address" value={addEmail} onChange={setAddEmail} />
                <Input
                  type="text"
                  placeholder="Card Number"
                  value={addCardNumber}
                  onChange={v => {
                    const d = v.replace(/\D/g, '').slice(0, 16)
                    setAddCardNumber(d.replace(/(\d{4})(?=\d)/g, '$1 '))
                  }}
                  rightSlot={addBrand !== 'unknown' ? <CardBrandIcon brand={addBrand} /> : <AllCardIcons />}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={addExpiry}
                    onChange={v => {
                      const d = v.replace(/\D/g, '').slice(0, 4)
                      setAddExpiry(d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d)
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="CVC"
                    value={addCvc}
                    onChange={v => setAddCvc(v.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="ZIP / Postal code"
                  value={addZip}
                  onChange={v => setAddZip(v.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10))}
                />
                <Checkbox checked={addSaveCard} onChange={setAddSaveCard} label="Save my card details for future payments" />

                {/* Pay button */}
                <button
                  onClick={() => {
                    const digits = addCardNumber.replace(/\s/g, '')
                    const last4 = digits.slice(-4) || '0000'
                    const detectedBrand = addBrand === 'unknown' ? 'visa' : addBrand
                    handleAddCard({ id: `new-${Date.now()}`, last4, brand: detectedBrand, expiry: addExpiry, requiresCvc: false })
                  }}
                  className="w-full h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white flex items-center justify-center hover:bg-[#3a7bd0] active:bg-[#3370c0] transition-all mt-2"
                >
                  Pay ${effectiveTotal.toFixed(2)}
                </button>

                {/* Legal text */}
                <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
                  By clicking "Pay" you indicate that you have read, understood and agree to Appcharge's{' '}
                  <a href="#" className="underline text-[#71717a]">EULA</a>{' '}and{' '}
                  <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
                </p>
              </div>
              {!isDesktop && <CheckoutFooter />}
            </div>
            {isDesktop && (
              <div className="-mx-[96px] mt-auto">
                <img src={desktopFooterSrc} alt="Footer" className="w-full block" draggable={false} />
              </div>
            )}
          </div>
        ) : (
          /* ── Normal payment panel ── */
          <div className={isDesktop ? 'flex flex-col bg-white flex-1 min-h-0' : 'flex flex-col bg-white'}>
          <div className={isDesktop ? 'flex-1 overflow-y-auto scrollbar-hide' : undefined}>

            {/* Express button */}
            {state.hasExpressMethods && (
              <ApplePayButton compact onClick={handleApplePay} type={state.expressButtonType} />
            )}

            {/* APMs tabs */}
            <APMSTabs
              selected={state.selectedPaymentMethod}
              hasExpress={isDesktop ? false : state.hasExpressMethods}
              enabledMethods={enabledPaymentMethods}
              onSelect={(method) => {
                if (method === 'other') {
                  onSetPaymentMethod('other')
                  setShowOtherMethodPicker(true)
                } else {
                  onSetPaymentMethod(method)
                }
              }}
            />

            {/* Payment form — animated */}
            <AnimatePresence mode="wait">
              {state.selectedPaymentMethod === 'paypal' && (
                <motion.div
                  key="paypal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={`${isDesktop ? 'px-6 pt-5' : 'px-4 pt-4'} flex flex-col pb-4 gap-4`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`${isDesktop ? 'text-[17px]' : 'text-[16px]'} leading-6 font-semibold text-[#09090b]`}>Pay with PayPal</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" />
                      <span className={`${isDesktop ? 'text-[15px]' : 'text-[14px]'} leading-5 font-normal text-[#71717a]`}>Secure and encrypted</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePayPal}
                    disabled={isPayLoading}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ height: 48, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
                  >
                    <div style={{ width: '100%', height: 48, borderRadius: 6, overflow: 'hidden', background: '#1070C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isPayLoading
                        ? <Spinner size={18} color="white" />
                        : <span style={{ color: 'white', fontSize: 16, fontWeight: 700, fontStyle: 'italic', letterSpacing: 0.2 }}>PayPal</span>
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
                  className={`${isDesktop ? 'px-6 pt-5' : 'px-4 pt-4'} flex flex-col pb-4 gap-4`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`${isDesktop ? 'text-[17px]' : 'text-[16px]'} leading-6 font-semibold text-[#09090b]`}>Pay with Google Pay</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" />
                      <span className={`${isDesktop ? 'text-[15px]' : 'text-[14px]'} leading-5 font-normal text-[#71717a]`}>Secure and encrypted</span>
                    </div>
                  </div>
                  <button
                    onClick={handleGPay}
                    disabled={isPayLoading}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ height: 48, padding: 0, background: 'transparent', border: 'none', display: 'flex' }}
                  >
                    <div style={{ width: '100%', height: 48, borderRadius: 6, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isPayLoading
                        ? <Spinner size={18} color="white" />
                        : <img src={googlePaySrc} alt="Pay with Google Pay" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: 'scale(1.12)' }} draggable={false} />
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
                    onOpenManageCards={() => {
                      setPickerLocalCards(allCards)
                      setPickerPendingId(state.selectedSavedCardId)
                      setPickerOpenMenuId(null)
                      setShowSavedCardsSheet(true)
                    }}
                    onPay={onSavedCardPay}
                    showLegal={!isDesktop}
                  />
                </motion.div>
              )}

              {state.selectedPaymentMethod === 'card' && state.userMode === 'new' && !isDesktop && (
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

              {state.selectedPaymentMethod === 'card' && state.userMode === 'new' && isDesktop && (
                <motion.div
                  key="card-desktop"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pt-5 pb-4 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[17px] leading-6 font-semibold text-[#09090b]">Pay with debit or credit card</span>
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" className="flex-shrink-0" />
                        <span className="text-[15px] leading-5 font-normal text-[#71717a]">Secure and encrypted</span>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="flex flex-col gap-3">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={state.cardForm.email}
                        onChange={v => onCardFormChange('email', v)}
                        error={state.cardErrors.email}
                        style={{ height: 48 }}
                      />
                      <Input
                        type="text"
                        placeholder="Card Number"
                        value={state.cardForm.cardNumber}
                        onChange={v => {
                          const d = v.replace(/\D/g, '').slice(0, 16)
                          onCardFormChange('cardNumber', d.replace(/(\d{4})(?=\d)/g, '$1 '))
                        }}
                        error={state.cardErrors.cardNumber}
                        style={{ height: 48 }}
                        rightSlot={
                          detectCardBrand(state.cardForm.cardNumber) !== 'unknown'
                            ? <CardBrandIcon brand={detectCardBrand(state.cardForm.cardNumber)} />
                            : <AllCardIcons />
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={state.cardForm.expiry}
                          onChange={v => {
                            const d = v.replace(/\D/g, '').slice(0, 4)
                            onCardFormChange('expiry', d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d)
                          }}
                          error={state.cardErrors.expiry}
                          style={{ height: 48 }}
                        />
                        <Input
                          type="text"
                          placeholder="CVC"
                          value={state.cardForm.cvc}
                          onChange={v => onCardFormChange('cvc', v.replace(/\D/g, '').slice(0, 4))}
                          error={state.cardErrors.cvc}
                          style={{ height: 48 }}
                        />
                      </div>
                      <Input
                        type="text"
                        placeholder="ZIP / Postal code"
                        value={state.cardForm.zip}
                        onChange={v => onCardFormChange('zip', v.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10))}
                        error={state.cardErrors.zip}
                        style={{ height: 48 }}
                      />
                    </div>

                    <Checkbox
                      checked={state.cardForm.saveCard}
                      onChange={v => onCardFormChange('saveCard', v)}
                      label="Save my card details for future payments"
                    />

                    <button
                      onClick={handleSubmitNewCard}
                      disabled={isPayLoading}
                      className="w-full h-[48px] text-[15px] leading-5 font-medium text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{ backgroundColor: pc, borderRadius: br }}
                    >
                      {isPayLoading ? <Spinner size={18} color="white" /> : `Pay $${effectiveTotal.toFixed(2)}`}
                    </button>

                    <p className="text-[11px] leading-4 font-normal text-[#71717a] text-center w-full">
                      By clicking "Pay" you indicate that you have read, understood and agree to Appcharge's{' '}
                      <a href="#" className="underline text-[#71717a]">EULA</a>{' '}and{' '}
                      <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
                    </p>
                  </div>
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
                    onOpenMethodSheet={() => setShowOtherMethodPicker(true)}
                    useDropdown={hasSelectedOtherMethod}
                    onMethodSelect={(id) => setSelectedOtherMethod(id)}
                    onChange={onOtherFormChange}
                    onPay={handleOtherPay}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {!isDesktop && (
              <div className="-ml-2 -mr-8">
                <img src={landscapeFooterSrc} alt="Footer" className="w-full block" draggable={false} />
              </div>
            )}
          </div>
          {isDesktop && (
            <div className="-mx-[72px]">
              <img src={desktopFooterSrc} alt="Footer" className="w-full block" draggable={false} />
            </div>
          )}
          </div>
        )}
      </div>

    </div>
  )
}
