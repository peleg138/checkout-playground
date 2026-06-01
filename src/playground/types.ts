export interface AppearanceConfig {
  primaryColor: string
  buttonRadius: number
  inputRadius: number
}

export interface BackgroundConfig {
  imageUrl: string | null
  backgroundType: 'image' | 'white'
  opacity: number
  blur: number
  overlay: number
  position: 'center' | 'top' | 'bottom'
  fit: 'cover' | 'contain'
}

export interface ProductItem {
  id: string
  name: string
  quantity: string
  icon: string
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
