import type { MockOrder } from '../types/checkout'
import ITEM_COINS from '../assets/icons/item-coins.png'
import ITEM_BOOSTER from '../assets/icons/item-booster.png'
import ITEM_XP from '../assets/icons/item-xp.png'

export const mockOrder: MockOrder = {
  game: { name: 'Royal Blast', logo: '' },
  offer: { title: 'Special Offer' },
  items: [
    { id: '1', name: 'Coins', quantity: '100,000', icon: ITEM_COINS },
    { id: '2', name: 'Booster', quantity: '10,000', icon: ITEM_BOOSTER },
    { id: '3', name: 'XP', quantity: '1,000', icon: ITEM_XP },
  ],
  pricing: {
    subtotal: 19.90,
    promoDiscount: 0,
    tax: 0,
    total: 19.90,
    currency: '$',
  },
  savedCards: [
    { id: 'card-1', last4: '2243', brand: 'mastercard', expiry: '12/26', requiresCvc: false },
    { id: 'card-2', last4: '4789', brand: 'visa',        expiry: '08/25', requiresCvc: false },
    { id: 'card-3', last4: '2111', brand: 'discover',    expiry: '03/27', requiresCvc: false },
    { id: 'card-4', last4: '3377', brand: 'amex',        expiry: '11/26', requiresCvc: false },
    { id: 'card-5', last4: '5284', brand: 'amex',        expiry: '06/28', requiresCvc: false },
  ],
  validPromoCodes: [
    { code: 'SAVE10', discount: 1.99, label: 'SAVE10' },
    { code: 'HEY02020', discount: 5.00, label: 'HEY02020' },
  ],
}
