import type { UpsellOffer, UpsellPack, UpsellRowOffer } from '../types/upsell'
import ITEM_COINS from '../assets/icons/item-coins.png'
import ITEM_BOOSTER from '../assets/icons/item-booster.png'
import ITEM_XP from '../assets/icons/item-xp.png'
import OFFER_STAIRCASE from '../assets/icons/offer-3-staircase.png'
import OFFER_GARDEN from '../assets/icons/offer-1-secret-garden.png'
import OFFER_CASTLE from '../assets/icons/offer-2-magic-castle.png'

/** The single spotlighted offer used by variants A and B. */
export const upsellPrimary: UpsellOffer = {
  id: 'vip-booster',
  title: 'VIP Booster Pack',
  blurb: 'Granted instantly — no second checkout.',
  image: OFFER_STAIRCASE,
  items: [
    { name: 'Boosters', qty: '25', icon: ITEM_BOOSTER },
    { name: 'Coins', qty: '50,000', icon: ITEM_COINS },
    { name: 'XP', qty: '2,000', icon: ITEM_XP },
  ],
  wasPrice: 9.90,
}

/** Parallel offers for variant C — no accept/decline binary, each its own CTA. */
export const upsellParallel: UpsellOffer[] = [
  {
    id: 'crystal-vault',
    title: 'Crystal Vault',
    blurb: '500 Crystals + 2,000 XP',
    image: OFFER_CASTLE,
    items: [
      { name: 'Crystals', qty: '500', icon: ITEM_XP },
      { name: 'XP', qty: '2,000', icon: ITEM_XP },
    ],
    wasPrice: 6.90,
  },
  {
    id: 'booster-bundle',
    title: 'Booster Bundle',
    blurb: '25 Boosters + 50,000 Coins',
    image: OFFER_STAIRCASE,
    items: [
      { name: 'Boosters', qty: '25', icon: ITEM_BOOSTER },
      { name: 'Coins', qty: '50,000', icon: ITEM_COINS },
    ],
    wasPrice: 9.90,
  },
]

/**
 * Milestone offer — the EverMerge / MergeDragons pattern from the research:
 * triggered by progress, not by the purchase. It rides on the success screen
 * because it is the one offer that isn't "you just paid, want more?".
 */
export const upsellMilestone: UpsellOffer = {
  id: 'secret-garden-completion',
  title: 'Finish Secret Garden',
  blurb: "You're 2 pieces away from completing the set.",
  image: OFFER_GARDEN,
  items: [
    { name: 'Garden Trees', qty: '1', icon: ITEM_BOOSTER },
    { name: 'Crown', qty: '1', icon: ITEM_XP },
    { name: 'Bonus Coins', qty: '5,000', icon: ITEM_COINS },
  ],
  wasPrice: 4.90,
}

/** Pack sizes for variant B's selector. */
export const upsellPacks: UpsellPack[] = [
  { id: 'x1', label: '×1', multiplier: 1, wasPrice: 9.90 },
  { id: 'x3', label: '×3', multiplier: 3, wasPrice: 24.90 },
  { id: 'x5', label: '×5', multiplier: 5, wasPrice: 39.90 },
]

/** Order reference shown on the confirmation strip. */
export const upsellOrderRef = 'RB-48213'

/**
 * Rows for the "Add to Your Purchase" screen. Anchors are set so the default
 * 50% lands on $9.90 — the price the hand-made version showed on both cards.
 */
export const upsellRows: UpsellRowOffer[] = [
  { id: 'booster-120', name: 'Booster', qty: '120',    icon: ITEM_BOOSTER, wasPrice: 19.90 },
  { id: 'coins-10k',   name: 'Coins',   qty: '10,000', icon: ITEM_COINS,   wasPrice: 19.90 },
  { id: 'xp-5k',       name: 'XP',      qty: '5,000',  icon: ITEM_XP,      wasPrice: 12.90 },
]

/** Masked details on the confirmation block. */
export const upsellReceipt = {
  orderId: '6a1842d…',
  email: 'r***@gmail.com',
  cardLast4: '9888',
}

/**
 * Offers for the Advanced screens. Anchors are set so the default 20% lands on
 * $9.90 from $12.90 — the numbers on the board's mock.
 */
export const upsellAdvancedOffers: UpsellRowOffer[] = [
  { id: 'coins-10k',   name: 'Coins',   qty: '10,000', icon: ITEM_COINS,   wasPrice: 12.90 },
  { id: 'booster-120', name: 'Booster', qty: '120',    icon: ITEM_BOOSTER, wasPrice: 19.90 },
  { id: 'xp-5k',       name: 'XP',      qty: '5,000',  icon: ITEM_XP,      wasPrice: 12.90 },
]

/**
 * The completed purchase the offer attaches to. The board's mock shows "Visa
 * 4242" on the confirmation but a Mastercard mark in the sheet — one card is
 * used here so the two can't disagree.
 */
export const upsellAdvancedOrder = {
  paidAmount: 9.99,
  cardBrand: 'visa' as const,
  cardLast4: '4242',
  orderId: 'AC-48213882010',
}
