import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { useAppearance } from '../../playground/AppearanceContext'
import { CardBrandIcon } from '../Payment/PaymentIcons'
import { money, Spinner, EASE_OUT } from './UpsellShared'
import { upsellAdvancedOrder } from '../../data/upsellData'
import logoSrc from '../../assets/icons/logo.png'
import type { UpsellRowOffer } from '../../types/upsell'

interface Props {
  open: boolean
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
export function UpsellPaySheet({ open, offer, price, currency, paying, onPay, onClose }: Props) {
  const { appearance, products } = useAppearance()

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
              <span className="text-[14px] leading-5 font-semibold text-[#09090b]">{offer.name}</span>
              <span className="text-[14px] leading-5 font-normal text-[#a1a1aa] ml-1.5 tabular-nums">
                {offer.qty}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[14px] leading-5 font-semibold text-[#09090b]">
                <ShoppingCart size={15} className="text-[#3f3f46]" />
                Details
                <ChevronDown size={15} className="text-[#3f3f46]" />
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[16px] leading-6 font-bold text-[#09090b]">Total</span>
              <span className="text-[16px] leading-6 font-bold text-[#09090b] tabular-nums">
                {money(price, currency)}
              </span>
            </div>

            {/* The stored credential, shown as selected rather than as a choice —
                there is only one card on file in this flow. */}
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

            <button
              onClick={onPay}
              disabled={paying}
              className="w-full h-12 text-[15px] leading-5 font-semibold text-white flex items-center justify-center gap-2 transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-default tabular-nums"
              style={{ background: appearance.primaryColor, borderRadius: appearance.buttonRadius }}
            >
              {paying ? <><Spinner /> Paying…</> : `Pay ${money(price, currency)}`}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
