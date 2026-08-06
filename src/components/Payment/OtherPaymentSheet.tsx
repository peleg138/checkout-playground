import React, { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PAYMENT_METHODS, type PaymentMethodOption } from './paymentMethodsData'
import circleCheck from '../../assets/icons/circle-check.png'

/* ── Check icon — exact uploaded asset, 16×16 px ───────────────── */
function CheckMark() {
  return (
    <img
      src={circleCheck}
      alt=""
      width={16}
      height={16}
      draggable={false}
    />
  )
}

/* ── Row component ───────────────────────────────────────────────── */
interface RowProps {
  method: PaymentMethodOption
  isSelected: boolean
  onSelect: () => void
}

function PaymentMethodRow({ method, isSelected, onSelect }: RowProps) {
  return (
    <button
      onClick={onSelect}
      className={[
        // Fixed height, horizontal flex, consistent padding — never changes between states
        'flex items-center w-full h-14 px-3 gap-3',
        // Shape
        'rounded-[8px] border',
        // State: only border color + bg tint change; nothing else shifts
        isSelected
          ? 'border-[#448ae3] bg-white'
          : 'border-[#e5e5e5] bg-white',
        'transition-colors',
      ].join(' ')}
    >
      {/*
        Icon container — always 44×44.
        When iconBg is 'transparent' the asset already contains its own background;
        no extra fill or shadow is applied so the PNG renders as-is.
        For Stripe (white bg) a subtle inset border keeps it defined against the row.
      */}
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          background: method.iconBg,
          boxShadow: method.iconBg === 'transparent' ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.07)',
        }}
      >
        {method.icon}
      </div>

      {/* Label — fills remaining space, always left-aligned */}
      <span className="flex-1 text-[14px] leading-5 font-normal text-[#09090b] text-left">
        {method.name}
      </span>

      {/*
        Check slot — ALWAYS w-5 h-5, whether selected or not.
        This fixed-width reservation prevents any horizontal shift
        of the icon and label when the checkmark appears/disappears.
      */}
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {isSelected && <CheckMark />}
      </div>
    </button>
  )
}

/* ── Sheet ───────────────────────────────────────────────────────── */
interface OtherPaymentSheetProps {
  isOpen: boolean
  selectedMethod: string
  onClose: () => void
  onSelect: (id: string) => void
}

export function OtherPaymentSheet({
  isOpen,
  selectedMethod,
  onClose,
  onSelect,
}: OtherPaymentSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="absolute inset-0 z-[60] pointer-events-none flex flex-col justify-end"
          onWheel={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={onClose}
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="relative bg-white w-full pointer-events-auto flex flex-col rounded-t-[16px]"
            style={{ height: 416, maxHeight: '90dvh', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-[10px] pb-[6px] flex-shrink-0">
              <div className="w-[36px] h-[4px] rounded-full bg-[#d1d5db]" />
            </div>

            {/* Title — fixed, never scrolls */}
            <div className="px-4 pt-3 pb-4 flex-shrink-0">
              <span className="text-[16px] leading-6 font-semibold text-[#09090b]">
                Select Payment Method
              </span>
            </div>

            {/* List — fills remaining height, scrolls internally */}
            <ScrollListArea
              selectedMethod={selectedMethod}
              onSelect={onSelect}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ScrollListArea({ selectedMethod, onSelect }: { selectedMethod: string; onSelect: (id: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  return (
    <div className="flex-1 min-h-0 relative">
      <div
        className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-10 transition-opacity duration-200"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
          opacity: scrolled ? 1 : 0,
        }}
      />
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scrollbar-hide px-4 pb-6"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={e => setScrolled((e.currentTarget.scrollTop) > 4)}
      >
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => (
            <PaymentMethodRow
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onSelect={() => onSelect(method.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
