import React, { useState, useEffect } from 'react'
import creditCardSrc from '../../assets/icons/credit-card.png'
import { AnimatePresence, motion } from 'framer-motion'
import circleCheckSrc from '../../assets/icons/circle-check.png'
import type { SavedCard } from '../../types/checkout'

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

function SheetDotsMenu({ isOpen, onOpen, onDelete }: { isOpen: boolean; onOpen: (e: React.MouseEvent) => void; onDelete: () => void }) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={e => { e.stopPropagation(); onOpen(e) }}
        className={[
          'w-6 h-6 flex items-center justify-center text-[#9ca3af] rounded-[6px] transition-colors',
          isOpen ? 'bg-[#f4f4f5]' : '',
        ].join(' ')}
        aria-label="Card options"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3.5" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="12.5" r="1.5" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-7 z-20 bg-white rounded-[10px] shadow-lg border border-[#e5e7eb] py-1 min-w-[110px]"
          >
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="flex items-center gap-2 w-[calc(100%-8px)] mx-1 px-2 py-2 text-[13px] text-red-500 hover:bg-red-50 rounded-[6px] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11 3.5l-.7 7.3a1 1 0 0 1-1 .9H4.7a1 1 0 0 1-1-.9L3 3.5" />
              </svg>
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AddNewCardRow({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border border-[#e5e5e5] rounded-[6px] w-full cursor-pointer bg-white"
    >
      <div className="h-[52px] px-3 flex items-center gap-3">
        <div className="w-[42px] h-[28px] flex-shrink-0 flex items-center justify-center">
          <img src={creditCardSrc} alt="" width={32} height={22} className="object-cover" draggable={false} />
        </div>
        <span className="flex-1 text-[14px] leading-5 font-normal text-[#09090b]">Add New Card</span>
        <div className="w-5 h-5 rounded-full bg-[#09090b] flex items-center justify-center flex-shrink-0 mr-1">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="1" x2="6" y2="11" />
            <line x1="1" y1="6" x2="11" y2="6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function SheetCardRow({
  card, selected, onSelect, menuOpen, onOpenMenu, onDelete,
}: {
  card: SavedCard; selected: boolean; onSelect: () => void; menuOpen: boolean; onOpenMenu: (e: React.MouseEvent) => void; onDelete: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={[
        'border rounded-[6px] w-full cursor-pointer transition-all',
        selected ? 'border-[#448ae3] bg-white' : 'border-[#e5e5e5] bg-white',
      ].join(' ')}
    >
      <div className="h-[52px] px-3 flex items-center gap-3">
        <div className="w-[42px] h-[28px] flex-shrink-0 border border-[#e4e4e7] rounded-[4px] bg-white overflow-hidden flex items-center justify-center">
          <BrandLogo brand={card.brand} />
        </div>
        <span className="flex-1 text-[14px] leading-5 font-normal text-[#09090b] tracking-wide">
          ****{card.last4}
        </span>
        {selected && (
          <img src={circleCheckSrc} alt="" width={18} height={18} draggable={false} className="flex-shrink-0" />
        )}
        <SheetDotsMenu isOpen={menuOpen} onOpen={onOpenMenu} onDelete={onDelete} />
      </div>
    </div>
  )
}

interface SavedCardsSheetProps {
  isOpen: boolean
  cards: SavedCard[]
  selectedId: string | null
  onClose: () => void
  onSelect: (id: string) => void
  onAddNewCard?: () => void
}

export function SavedCardsSheet({ isOpen, cards, selectedId, onClose, onSelect, onAddNewCard }: SavedCardsSheetProps) {
  const [localCards, setLocalCards] = useState(cards)
  const [pendingId, setPendingId] = useState<string | null>(selectedId)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) { setLocalCards(cards); setPendingId(selectedId); setOpenMenuId(null) }
  }, [isOpen, selectedId])

  const handleSelect = () => {
    if (pendingId) onSelect(pendingId)
    onClose()
  }

  const atMax = localCards.length >= 5

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[60] pointer-events-none flex flex-col justify-end">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="relative bg-white w-full pointer-events-auto flex flex-col rounded-t-[16px]"
            style={{ maxHeight: '90dvh', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-[10px] pb-[6px] flex-shrink-0">
              <div className="w-[36px] h-[4px] rounded-full bg-[#d1d5db]" />
            </div>

            {/* Title */}
            <div className="px-4 pt-3 pb-4 flex-shrink-0">
              <span className="text-[16px] leading-6 font-semibold text-[#09090b]">Saved Cards</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-2">
              {/* Info box — only when at max */}
              {atMax && (
                <div className="flex items-start gap-3 bg-[#eff6ff] rounded-[8px] px-3 py-3 mb-4">
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

              {/* Backdrop to close menu */}
              {openMenuId && (
                <div className="absolute inset-0 z-10" onClick={() => setOpenMenuId(null)} />
              )}

              {/* Card list */}
              <div className="flex flex-col gap-2">
                {/* Add New Card row — only when not at max */}
                {!atMax && <AddNewCardRow onClick={() => { onAddNewCard?.() }} />}
                {localCards.map(card => (
                  <SheetCardRow
                    key={card.id}
                    card={card}
                    selected={pendingId === card.id}
                    onSelect={() => { setPendingId(card.id); setOpenMenuId(null) }}
                    menuOpen={openMenuId === card.id}
                    onOpenMenu={e => { e.stopPropagation(); setOpenMenuId(id => id === card.id ? null : card.id) }}
                    onDelete={() => {
                      setLocalCards(prev => prev.filter(c => c.id !== card.id))
                      if (pendingId === card.id) setPendingId(localCards.find(c => c.id !== card.id)?.id ?? null)
                      setOpenMenuId(null)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="px-4 pt-4 pb-6 flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handleSelect}
                className="w-full h-11 rounded-[6px] bg-[#09090b] text-[14px] leading-5 font-medium text-white flex items-center justify-center"
              >
                Select
              </button>
              <button
                onClick={onClose}
                className="w-full h-11 rounded-[6px] border border-[#e4e4e7] bg-white text-[14px] leading-5 font-medium text-[#09090b] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
