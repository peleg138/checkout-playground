import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { CardBrandIcon } from '../Payment/PaymentIcons'
import { money, Spinner, EASE_OUT } from './UpsellShared'
import { upsellAdvancedOrder } from '../../data/upsellData'
import logoSrc from '../../assets/icons/logo.png'
import shoppingCartSrc from '../../assets/icons/ShoppingCart.png'
import type { UpsellRowOffer } from '../../types/upsell'
import { WalletPayButton, WalletConfirm } from './WalletMarks'
import type { UpsellPayMethod } from './WalletMarks'

interface Props {
  open: boolean
  payWith: UpsellPayMethod
  offer: UpsellRowOffer | null
  price: number
  currency: string
  paying: boolean
  onPay: () => void
  onClose: () => void
}

/**
 * Confirmation sheet for options 1 and 2 — the step that turns "Add to Cart"
 * into a second charge.
 *
 * It is `absolute inset-0`, not fixed: the 375×812 frame is the containing
 * block for every sheet in this prototype, so the backdrop clips to the device
 * rather than covering the playground around it.
 */
export function UpsellPaySheet({ open, payWith, offer, price, currency, paying, onPay, onClose }: Props) {
  const { appearance, products } = useAppearance()
  const [showDetails, setShowDetails] = useState(false)


  return (
    <AnimatePresence>
      {open && offer && (
        <motion.div className="absolute inset-0 z-20 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="absolute inset-0 bg-black/50"
            onClick={paying ? undefined : onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            /* Exit is quicker than enter — the system responding should feel
               faster than the player deciding. */
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="relative m-2 bg-white rounded-[16px] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={products.gameLogo || logoSrc}
                alt=""
                className="w-9 h-9 rounded-[6px] object-contain flex-shrink-0"
                draggable={false}
              />
              <span className="text-[16px] leading-6 font-bold text-[#09090b]">
                {products.gameName || 'Royal Blast'}
              </span>
              <button
                onClick={onClose}
                disabled={paying}
                className="ml-auto -mr-1 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#f4f4f5] disabled:opacity-40"
                aria-label="Close"
              >
                <X size={18} className="text-[#09090b]" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center">
              <span className="text-[14px] leading-5 font-semibold text-[#09090b]">One Time Offer</span>
              <button
                onClick={() => setShowDetails(v => !v)}
                aria-expanded={showDetails}
                aria-label="Toggle details"
                className="ml-auto flex items-center gap-0.5 py-1 pl-2 text-[#09090b]"
              >
                <img
                  src={shoppingCartSrc}
                  alt=""
                  width={16}
                  height={16}
                  draggable={false}
                  className="flex-shrink-0 mr-1"
                />
                <span className="text-[14px] leading-5 font-medium min-w-[41px] w-[41px] text-center">
                  Details
                </span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  className="flex-shrink-0 ml-1"
                  style={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                >
                  <path d="M5 7.5l5 5 5-5" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* What is actually being bought — picture, name, quantity. The
                price is the Total directly below, so it is not repeated. */}
            <AnimatePresence initial={false}>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 border-t border-[#e4e4e7] pt-3">
                    <div className="w-9 h-9 rounded-[6px] overflow-hidden flex-shrink-0">
                      <img src={offer.icon} className="w-full h-full object-cover block" alt="" />
                    </div>
                    <p className="text-[14px] leading-5 font-semibold text-[#09090b] truncate min-w-0">
                      {offer.name}
                    </p>
                    <span className="ml-auto text-[14px] leading-5 font-normal text-[#09090b] tabular-nums">
                      {offer.qty}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-baseline justify-between">
              <span className="text-[16px] leading-6 font-bold text-[#09090b]">Total</span>
              <span className="text-[16px] leading-6 font-bold text-[#09090b] tabular-nums">
                {money(price, currency)}
              </span>
            </div>

            {/*
              Card only. Tapping a wallet button hands instrument selection to
              the OS sheet, so a picker here would duplicate it and imply a
              choice this screen doesn't own.
            */}
            {payWith === 'card' && (
              <div
                className="flex items-center gap-2.5 h-14 px-3 bg-[#f5f9ff]"
                style={{ borderRadius: appearance.buttonRadius, border: `1px solid ${appearance.primaryColor}` }}
              >
                <CardBrandIcon brand={upsellAdvancedOrder.cardBrand} />
                <span className="text-[14px] leading-5 font-normal text-[#09090b] tabular-nums">
                  ••••{upsellAdvancedOrder.cardLast4}
                </span>
                <CheckCircle2 size={18} className="ml-auto flex-shrink-0" style={{ color: appearance.primaryColor }} />
              </div>
            )}

            {/* Apple and Google both require their own artwork to be the button
                rather than a label on ours, so the CTA is replaced outright. */}
            {payWith === 'card' ? (
              <button
                onClick={onPay}
                disabled={paying}
                className="w-full h-12 text-[15px] leading-5 font-semibold text-white flex items-center justify-center gap-2 transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-default tabular-nums"
                style={{ background: appearance.primaryColor, borderRadius: appearance.buttonRadius }}
              >
                {paying ? <><Spinner /> Paying…</> : `Pay ${money(price, currency)}`}
              </button>
            ) : (
              <WalletPayButton
                method={payWith}
                onClick={onPay}
                disabled={paying}
                radius={appearance.buttonRadius}
              />
            )}
          </motion.div>

          {/* Up with the sheet — the double-press is the confirmation, so it
              is on offer from the moment the sheet is. */}
          {payWith !== 'card' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.22, ease: EASE_OUT }}
              className="absolute inset-0 z-30 pointer-events-none"
            >
              <WalletConfirm />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
