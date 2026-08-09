export interface AppearanceConfig {
  primaryColor: string
  buttonRadius: number
  inputRadius: number
  showGameName: boolean
  showCoupon: boolean
}

export interface BackgroundConfig {
  imageUrl: string | null
  backgroundType: 'image' | 'white'
  opacity: number
  blur: number
  overlay: number
  position: 'center' | 'top' | 'bottom'
  fit: 'cover' | 'contain'
  /** One entry per offer, index-aligned with products.multiOffers. */
  offerImages?: (string | null)[]
}

export interface ProductItem {
  id: string
  name: string
  quantity: string
  icon: string
}

export interface MultiOfferSubItem {
  name: string
  qty: string
}

export interface MultiOffer {
  id: string
  title: string
  price: string
  qty: number
  items: MultiOfferSubItem[]
}

export interface ProductsConfig {
  offerTitle: string
  gameName: string
  gameLogo: string
  items: ProductItem[]
  subtotal: number
  tax: number
  currency: string
  showProductImages: boolean
  offerCount?: number
  multiOffers?: MultiOffer[]
}

export interface PaymentMethodConfig {
  id: 'card' | 'paypal' | 'gpay' | 'other'
  enabled: boolean
  label: string
  order: number
}

export interface PromoConfig {
  enabled: boolean
  validCodes: Array<{ code: string; discount: number; label: string }>
}

export interface CheckoutModeConfig {
  hasExpressMethods: boolean
  expressButtonType: 'apple' | 'google' | 'paypal'
  userMode: 'new' | 'saved'
}

export interface PlaygroundConfig {
  checkoutMode: CheckoutModeConfig
  paymentMethods: PaymentMethodConfig[]
  products: ProductsConfig
  promo: PromoConfig
  background: BackgroundConfig
  appearance: AppearanceConfig
}
