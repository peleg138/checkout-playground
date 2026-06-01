import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DeclinedScreenProps {
  onTryAgain: () => void
  onUseDifferentCard: () => void
}

export function DeclinedScreen({ onTryAgain, onUseDifferentCard }: DeclinedScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center px-6 py-8 text-center bg-white"
    >
      {/* Red X icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-red-500/30"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <X size={38} color="white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="mb-8 flex flex-col gap-2"
      >
        <p className="text-[16px] leading-6 font-bold text-[#09090b]">Payment Declined</p>
        <p className="text-[14px] leading-5 font-normal text-[#71717a] leading-relaxed">
          Your payment could not be processed.
          <br />
          Please check your card details and try again.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={onTryAgain}
          className="w-full h-11 rounded-[6px] bg-[#448ae3] text-[14px] leading-5 font-medium text-white px-8 py-2 hover:bg-[#3a7bd0] active:bg-[#3370c0] transition-all flex items-center justify-center"
        >
          Try Again
        </button>
        <button
          onClick={onUseDifferentCard}
          className="w-full h-11 rounded-[6px] bg-white text-[14px] leading-5 font-medium text-[#448ae3] border border-[#448ae3] px-8 py-2 hover:bg-blue-50 transition-all flex items-center justify-center"
        >
          Use a Different Card
        </button>
      </motion.div>
    </motion.div>
  )
}
