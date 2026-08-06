import type { PlaygroundConfig } from './types'
import ITEM_COINS from '../assets/icons/item-coins.png'
import ITEM_BOOSTER from '../assets/icons/item-booster.png'
import ITEM_XP from '../assets/icons/item-xp.png'
import LOGO from '../assets/icons/logo.png'
import GAME_BG from '../assets/icons/default-background.png'
import OFFER_1 from '../assets/icons/offer-1-secret-garden.png'
import OFFER_2 from '../assets/icons/offer-2-magic-castle.png'
import OFFER_3_STAIRCASE from '../assets/icons/offer-3-staircase.png'

export const DEFAULT_CONFIG: PlaygroundConfig = {
  checkoutMode: {
    hasExpressMethods: true,
    expressButtonType: 'apple',
    userMode: 'new',
  },
  paymentMethods: [
    { id: 'card',   enabled: true, label: 'Card',       order: 0 },
    { id: 'paypal', enabled: true, label: 'PayPal',     order: 1 },
    { id: 'gpay',   enabled: true, label: 'Google Pay', order: 2 },
    { id: 'other',  enabled: true, label: 'Other',      order: 3 },
  ],
  products: {
    offerTitle: 'Special Offer',
    gameName: 'Royal Blast',
    gameLogo: LOGO,
    items: [
      { id: '1', name: 'Coins',   quantity: '100,000', icon: ITEM_COINS },
      { id: '2', name: 'Booster', quantity: '10,000',  icon: ITEM_BOOSTER },
      { id: '3', name: 'XP',      quantity: '1,000',   icon: ITEM_XP },
    ],
    subtotal: 19.90,
    tax: 0,
    currency: '$',
    showProductImages: true,
    offerCount: 3,
    multiOffers: [
      {
        id: '1',
        title: 'Secret Garden Starter Bundle',
        price: '$4.99',
        qty: 10,
        items: [
          { name: 'Garden Trees', qty: '1' },
          { name: 'Crown', qty: '1' },
          { name: 'Treasure Chest', qty: '2' },
          { name: 'Crystals', qty: '50' },
        ],
      },
      {
        id: '2',
        title: 'Magic Castle Starter Bundle',
        price: '$4.99',
        qty: 2,
        items: [
          { name: 'Boosters', qty: '2' },
          { name: 'Gems', qty: '4' },
          { name: 'XP (Potion)', qty: '4' },
        ],
      },
      {
        id: '3',
        title: 'Fancy Castle VIP \nVIP Bundle',
        price: '$12.99',
        qty: 0,
        items: [
          { name: 'Treasure Chest', qty: '1' },
          { name: 'Blue Crystal', qty: '1' },
          { name: 'Coins', qty: '300' },
          { name: 'Boosters', qty: '50' },
        ],
      },
    ],
  },
  promo: {
    enabled: true,
    validCodes: [
      { code: 'SAVE10',   discount: 1.99, label: 'SAVE10' },
      { code: 'HEY02020', discount: 5.00, label: 'HEY02020' },
      { code: 'VIP25',    discount: 4.98, label: 'VIP25' },
    ],
  },
  background: {
    imageUrl: GAME_BG,
    backgroundType: 'image',
    opacity: 100,
    blur: 0,
    overlay: 38,
    position: 'center',
    fit: 'cover',
    offerImages: [OFFER_1, OFFER_2, OFFER_3_STAIRCASE],
  },
  appearance: {
    primaryColor: '#448ae3',
    buttonRadius: 6,
    inputRadius: 6,
    showGameName: false,
    showCoupon: true,
  },
}
