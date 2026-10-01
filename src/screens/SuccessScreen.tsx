import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { mockOrder } from '../data/mockData'

interface SuccessScreenProps {
  effectiveTotal: number
  onReturnToGame: () => void
  isDesktop?: boolean
  /**
   * Items added by a post-purchase upsell, appended to the order the player
   * already paid for. Optional — omit and the summary is unchanged.
   */
  extraItems?: Array<{ id: string; name: string; price: number; icon: string }>
  /** Slot for the success-screen upsell widget (variant C). Optional. */
  upsellSlot?: React.ReactNode
}

export function SuccessScreen({ effectiveTotal, onReturnToGame, isDesktop = false, extraItems, upsellSlot }: SuccessScreenProps) {
  const { game, offer, items, pricing } = mockOrder

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center px-6 py-8 text-center bg-white w-full"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <Check size={28} color="white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="space-y-1 mb-6"
      >
        <p className="text-[16px] leading-6 font-bold text-[#09090b]">Payment Successful!</p>
        <p className="text-[14px] leading-5 font-normal text-[#71717a]">
          {offer.title}
        </p>
      </motion.div>

      {/* Items summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full bg-gray-50 rounded-[6px] p-4 mb-5 flex flex-col gap-2 overflow-y-auto"
        style={isDesktop ? undefined : { maxHeight: 120 }}
      >
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0">
                <img src={item.icon} className="w-full h-full object-cover block" alt={item.name} />
              </div>
              <span className="text-[14px] leading-5 font-normal text-black">{item.name}</span>
            </div>
            <span className="text-[14px] leading-5 font-normal text-black">{item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-[#e4e4e7] pt-2 flex justify-between">
          <span className="text-[14px] leading-5 font-bold text-[#09090b]">Total paid</span>
          <span className="text-[14px] leading-5 font-bold text-[#09090b]">
            {pricing.currency}{effectiveTotal.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {extraItems && extraItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="w-full border border-[#bbf7d0] bg-[#f0fdf4] rounded-[6px] p-3 mb-5 flex flex-col gap-2"
        >
          <span className="text-[11px] leading-4 font-semibold tracking-[.06em] uppercase text-[#15803d] text-left">
            Added after payment
          </span>
          {extraItems.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-[4px] overflow-hidden flex-shrink-0">
                  <img src={item.icon} className="w-full h-full object-cover block" alt={item.name} />
                </div>
                <span className="text-[13px] leading-5 font-medium text-[#09090b] truncate">{item.name}</span>
              </div>
              <span className="text-[13px] leading-5 font-medium text-[#09090b] flex-shrink-0">
                +{pricing.currency}{item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.3 }}
        className="w-full"
      >
        <button
          onClick={onReturnToGame}
          className="w-full h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white px-8 py-2 hover:bg-[#3a7bd0] active:bg-[#3370c0] transition-all flex items-center justify-center"
        >
          Return to Game
        </button>
      </motion.div>

      {upsellSlot}
    </motion.div>
  )
}
