import React from 'react'
import type { CardBrand } from '../../types/checkout'

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s/g, '')
  if (!digits) return 'unknown'
  if (digits[0] === '4') return 'visa'
  if (digits[0] === '5') return 'mastercard'
  if (digits[0] === '3') return 'amex'
  if (digits[0] === '6') return 'discover'
  return 'unknown'
}

function VisaSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 38" width="100%" height="100%">
      <text
        x="50%" y="54%"
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
        fontWeight="900" fontSize="22" fill="#1A1F71" letterSpacing="-0.5"
      >VISA</text>
    </svg>
  )
}

function MastercardSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 38" width="100%" height="100%">
      <circle cx="24" cy="19" r="11" fill="#EB001B" />
      <circle cx="36" cy="19" r="11" fill="#F79E1B" />
      <path
        d="M30 9.7a11 11 0 0 1 0 18.6A11 11 0 0 1 30 9.7z"
        fill="#FF5F00"
      />
    </svg>
  )
}

function AmexSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 38" width="100%" height="100%">
      <rect width="60" height="38" fill="#016FD0" />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700" fontSize="13" fill="white" letterSpacing="1.5"
      >AMEX</text>
    </svg>
  )
}

function DiscoverSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 38" width="100%" height="100%">
      <text
        x="3" y="50%"
        dominantBaseline="central"
        fontFamily="Arial, sans-serif"
        fontWeight="700" fontSize="9" fill="#231F20"
        letterSpacing="-0.3"
      >DISCOVER</text>
      <circle cx="54" cy="19" r="13" fill="#F76F20" />
    </svg>
  )
}

function brandSvg(brand: CardBrand | 'mastercard' | 'visa'): React.ReactNode {
  if (brand === 'visa') return <VisaSvg />
  if (brand === 'mastercard') return <MastercardSvg />
  if (brand === 'amex') return <AmexSvg />
  if (brand === 'discover') return <DiscoverSvg />
  return null
}

interface CardBrandIconProps {
  brand: CardBrand | 'mastercard' | 'visa'
  size?: 'sm' | 'md'
  className?: string
}

export function CardBrandIcon({ brand, className = '' }: CardBrandIconProps) {
  const svg = brandSvg(brand)
  if (!svg) return null
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center bg-white border border-[#e4e4e7] rounded-[3px] overflow-hidden ${className}`}
      style={{ width: '34px', height: '22px' }}
    >
      {svg}
    </div>
  )
}

export function AllCardIcons() {
  return (
    <div className="flex items-center gap-1">
      <CardBrandIcon brand="visa" />
      <CardBrandIcon brand="mastercard" />
      <CardBrandIcon brand="amex" />
      <CardBrandIcon brand="discover" />
    </div>
  )
}
