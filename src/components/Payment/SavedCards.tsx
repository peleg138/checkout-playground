import React, { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Spinner } from '../UI/Spinner'
import type { SavedCard } from '../../types/checkout'
import { ICON_CVC_CARD } from '../../data/assets'
import circleCheckSrc from '../../assets/icons/circle-check.png'
import { useAppearance } from '../../playground/AppearanceContext'

interface SavedCardsProps {
  cards: SavedCard[]
  selectedId: string | null
  effectiveTotal: number
  isPayLoading: boolean
  onSelect: (id: string) => void
  onOpenManageCards: () => void
  onPay: (cvc?: string) => void
  /** Desktop shows its own footer under the panel, so it opts out of the inline legal line. */
  showLegal?: boolean
}

/* ── Brand logos ─────────────────────────────────────────────────── */
function VisaLogo() {
  return (
    <svg viewBox="0 0 42 28" width="42" height="28" fill="none">
      <text x="21" y="19" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700" fontSize="14" fill="#1A1F71" letterSpacing="0.5">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 42 28" width="42" height="28" fill="none">
      <circle cx="16" cy="14" r="9" fill="#EB001B" />
      <circle cx="26" cy="14" r="9" fill="#F79E1B" />
      <path d="M21 7.13A9 9 0 0 1 24.87 14 9 9 0 0 1 21 20.87 9 9 0 0 1 17.13 14 9 9 0 0 1 21 7.13z" fill="#FF5F00" />
    </svg>
  )
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 42 28" width="42" height="28" fill="none">
      <rect width="42" height="28" rx="3" fill="#2E77BC" />
      <text x="21" y="19" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700" fontSize="10" fill="white" letterSpacing="0.5">AMEX</text>
    </svg>
  )
}

function DiscoverLogo() {
  return (
    <svg viewBox="0 0 42 28" width="42" height="28" fill="none">
      <rect width="42" height="28" rx="3" fill="#fff" />
      <text x="7" y="18" fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700" fontSize="7" fill="#231F20">DISCOVER</text>
      <circle cx="34" cy="14" r="7" fill="#F76F20" />
    </svg>
  )
}

function BrandLogo({ brand }: { brand: SavedCard['brand'] }) {
  if (brand === 'visa') return <VisaLogo />
  if (brand === 'mastercard') return <MastercardLogo />
  if (brand === 'amex') return <AmexLogo />
  if (brand === 'discover') return <DiscoverLogo />
  return null
}

/* ── Circle-check selection indicator ───────────────────────────── */
function CircleCheck({ selected }: { selected: boolean }) {
  if (selected) {
    return <img src={circleCheckSrc} alt="" width={20} height={20} draggable={false} className="flex-shrink-0" />
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  )
}

/* ── Three-dots menu with Delete ─────────────────────────────────── */
function DotsMenu({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="w-6 h-6 flex items-center justify-center text-[#9ca3af]"
        aria-label="Card options"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3.5" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="12.5" r="1.5" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-7 z-20 bg-white rounded-[10px] shadow-lg border border-[#e5e7eb] py-1 min-w-[100px]"
            >
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#09090b] hover:bg-gray-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2.5l2 2-6 6H3.5v-2l6-6zM8.5 3.5l2 2" />
                </svg>
                Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onDelete() }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11 3.5l-.7 7.3a1 1 0 0 1-1 .9H4.7a1 1 0 0 1-1-.9L3 3.5" />
                </svg>
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Single card row ─────────────────────────────────────────────── */
function SavedCardItem({
  card, selected, onSelect, onDelete, onEdit,
}: {
  card: SavedCard; selected: boolean; onSelect: () => void; onDelete: () => void; onEdit: () => void
}) {
  return (
    <div
      className={[
        'border rounded-[6px] w-full cursor-pointer transition-all',
        selected ? 'border-[#448ae3] bg-[#EBF3FF]' : 'border-[#e5e5e5] bg-white',
      ].join(' ')}
      onClick={onSelect}
    >
      <div className="h-[52px] px-3 flex items-center gap-3">
        <div className="w-[42px] h-[28px] flex-shrink-0 border border-[#e4e4e7] rounded-[4px] bg-white overflow-hidden flex items-center justify-center">
          <BrandLogo brand={card.brand} />
        </div>
        <span className="flex-1 text-[14px] leading-5 font-normal text-[#09090b] tracking-wide">
          ****{card.last4}
        </span>
        {selected && <img src={circleCheckSrc} alt="" width={17} height={17} draggable={false} className="flex-shrink-0" />}
        <DotsMenu onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────── */
export function SavedCards({
  cards,
  selectedId,
  effectiveTotal,
  isPayLoading,
  onSelect,
  onOpenManageCards,
  onPay,
  showLegal = true,
}: SavedCardsProps) {
  const [localCards, setLocalCards] = useState(cards)
  const [cvcValue, setCvcValue] = useState('')
  const [cvcError, setCvcError] = useState('')
  const { appearance } = useAppearance()

  useEffect(() => { setLocalCards(cards) }, [cards])

  const selectedCard = localCards.find(c => c.id === selectedId)

  const handlePay = () => {
    if (selectedCard?.requiresCvc) {
      if (!cvcValue || cvcValue.length < 3) { setCvcError('Enter a valid CVC'); return }
      setCvcError('')
      onPay(cvcValue)
    } else {
      onPay()
    }
  }

  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <span className="text-[16px] leading-6 font-semibold text-[#09090b]">
          Pay with debit or credit card
        </span>
        <div className="flex items-center gap-1">
          <ShieldCheck size={18} strokeWidth={1.5} color="#3f3f46" className="flex-shrink-0" />
          <span className="text-[14px] leading-5 font-normal text-[#71717a]">
            Secure and encrypted
          </span>
        </div>
      </div>

      {/* Card list */}
      <div className="flex flex-col gap-2">
        {localCards.map(card => (
          <React.Fragment key={card.id}>
            <SavedCardItem
              card={card}
              selected={selectedId === card.id}
              onSelect={() => { onSelect(card.id); setCvcValue(''); setCvcError('') }}
              onDelete={() => setLocalCards(prev => prev.filter(c => c.id !== card.id))}
              onEdit={onOpenManageCards}
            />

            {/* CVC expansion */}
            <AnimatePresence>
              {selectedId === card.id && card.requiresCvc && (
                <motion.div
                  key={`cvc-${card.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="bg-white border border-[#e5e5e5] rounded-[6px] p-1">
                    <div className="px-[6px] py-[6px] flex flex-col gap-3">
                      <span className="text-[12px] leading-4 font-semibold text-[#18181b]">Security Code</span>
                      <div className={[
                        'flex items-center h-10 rounded-[6px] border bg-white px-3 py-2 gap-1 transition-all',
                        cvcError ? 'border-red-500' : 'border-[#e5e7eb] focus-within:border-[#448ae3] focus-within:ring-2 focus-within:ring-[#448ae3]/20',
                      ].join(' ')}>
                        <input
                          type="text"
                          value={cvcValue}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                            setCvcValue(v)
                            if (cvcError && v.length >= 3) setCvcError('')
                          }}
                          placeholder="CVC"
                          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] leading-5 font-normal text-[#09090b] placeholder:text-[#71717a]"
                        />
                        <img src={ICON_CVC_CARD} className="w-4 h-4 flex-shrink-0" alt="" />
                      </div>
                      {cvcError && <span className="text-[12px] leading-4 text-red-500">{cvcError}</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))}

        {/* Add New Card */}
        <button
          onClick={onOpenManageCards}
          className="flex items-center gap-1.5 text-[14px] leading-5 text-[#09090b] font-normal hover:text-[#3a7bd0] transition-colors py-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
            <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          <span>Add New Card</span>
        </button>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isPayLoading}
        className="w-full h-11 text-[14px] leading-5 font-medium text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        style={{ backgroundColor: appearance.primaryColor, borderRadius: appearance.buttonRadius }}
      >
        {isPayLoading ? <Spinner size={18} color="white" /> : `Pay $${effectiveTotal.toFixed(2)}`}
      </button>

      {showLegal && (
        <p className="text-[10px] leading-4 font-normal text-[#71717a] text-center w-full">
          By clicking "Pay" you indicate that you have read, understood and agree to Appcharge's{' '}
          <a href="#" className="underline text-[#71717a]">EULA</a>{' '}and{' '}
          <a href="#" className="underline text-[#71717a]">Privacy Policy</a>
        </p>
      )}
    </div>
  )
}
