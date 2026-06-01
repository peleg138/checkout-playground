import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Spinner } from '../components/UI/Spinner'

interface ProcessingScreenProps {
  onDone: (result: 'success' | 'declined') => void
}

export function ProcessingScreen({ onDone }: ProcessingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = Math.random() < 0.8 ? 'success' : 'declined'
      onDone(result)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 min-h-[300px]"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="mb-6"
      >
        <Spinner size={52} color="blue" />
      </motion.div>
      <p className="text-base font-semibold text-gray-800 text-center">Processing your payment...</p>
      <p className="text-sm text-gray-400 text-center mt-1.5">Please don't close this window</p>
    </motion.div>
  )
}
