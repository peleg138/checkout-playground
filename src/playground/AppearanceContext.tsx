import React, { createContext, useContext } from 'react'
import type { AppearanceConfig, BackgroundConfig, ProductsConfig, PromoConfig } from './types'

interface AppearanceContextValue {
  appearance: AppearanceConfig
  background: BackgroundConfig
  products: ProductsConfig
  promo: PromoConfig
  showProductImages: boolean
}

const defaultAppearance: AppearanceConfig = {
  primaryColor: '#448ae3',
  buttonRadius: 6,
  inputRadius: 6,
  showGameName: true,
  showCoupon: true,
}

const defaultBackground: BackgroundConfig = {
  imageUrl: null,
  backgroundType: 'image',
  opacity: 100,
  blur: 0,
  overlay: 0,
  position: 'center',
  fit: 'cover',
}

export const AppearanceContext = createContext<AppearanceContextValue>({
  appearance: defaultAppearance,
  background: defaultBackground,
  products: {
    offerTitle: 'Special Offer',
    gameName: 'Royal Blast',
    gameLogo: '',
    items: [],
    subtotal: 19.90,
    tax: 0,
    currency: '$',
    showProductImages: true,
  },
  promo: {
    enabled: true,
    validCodes: [],
  },
  showProductImages: true,
})

export function useAppearance() {
  return useContext(AppearanceContext)
}
