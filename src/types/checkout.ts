export type Screen = 'checkout' | 'processing' | 'success' | 'declined'

export type PaymentMethod = 'card' | 'paypal' | 'gpay' | 'other'

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

export type PromoStatus = 'idle' | 'success' | 'error' | 'expired'

export interface OrderItem {
  id: string
  name: string
  quantity: string
  icon: string
}

export interface Pricing {
  subtotal: number
  promoDiscount: number
  tax: number
  total: number
  currency: string
}

export interface SavedCard {
  id: string
  last4: string
  brand: 'mastercard' | 'visa' | 'amex' | 'discover'
  expiry: string
  requiresCvc: boolean
}

export interface PromoCode {
  code: string
  discount: number
  label: string
}

export interface MockOrder {
  game: { name: string; logo: string }
  offer: { title: string }
  items: OrderItem[]
  pricing: Pricing
  savedCards: SavedCard[]
  validPromoCodes: PromoCode[]
}

export interface CardFormData {
  email: string
  cardNumber: string
  expiry: string
  cvc: string
  zip: string
  saveCard: boolean
}

export interface CardFormErrors {
  email?: string
  cardNumber?: string
  expiry?: string
  cvc?: string
  zip?: string
}

export interface OtherPaymentFormData {
  method: string
  email: string
  address: string
  city: string
  state: string
}

export interface CheckoutState {
  screen: Screen
  headerExpanded: boolean
  selectedPaymentMethod: PaymentMethod
  selectedSavedCardId: string | null
  showAddNewCard: boolean
  cardForm: CardFormData
  cardErrors: CardFormErrors
  otherForm: OtherPaymentFormData
  promoCode: string
  promoStatus: PromoStatus
  promoDiscount: number
  promoLabel: string
  hasSubmitted: boolean
  userMode: 'new' | 'saved'
  hasExpressMethods: boolean
  expressButtonType: 'apple' | 'google' | 'paypal'
}
