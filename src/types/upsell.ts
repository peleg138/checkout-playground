/**
 * Post-purchase upsell — the offer that sits between "payment confirmed" and
 * the success screen. Three variants, each one a different answer to the same
 * research finding: urgency has to scale down as the offer moves further from
 * the moment of payment.
 */

export type UpsellVariant =
  | 'off'
  /** 1 — Add to Cart, then a pay sheet confirms the second charge. */
  | 'cart'
  /** 2 — the same, with the offer in a swipeable carousel. */
  | 'carousel'
  /** 3 — Buy now: one tap charges the stored card, no sheet. */
  | 'oneTap'

export interface UpsellItem {
  name: string
  qty: string
  icon: string
}

export interface UpsellOffer {
  id: string
  title: string
  /** One line of value-prop. Wolt's "delivered together" slot. */
  blurb: string
  image: string
  items: UpsellItem[]
  /** Pre-discount anchor. The live price is derived from the config discount. */
  wasPrice: number
}

/** Variant/quantity selector — the True Classic pattern, ported to bundles. */
export interface UpsellPack {
  id: string
  label: string
  /** Multiplier applied to the offer's item quantities. */
  multiplier: number
  wasPrice: number
}

/** What a claimed upsell contributes to the original order. */
export interface UpsellAdded {
  id: string
  title: string
  price: number
  icon: string
  /** Right-hand column in the order summary — bundles use a multiplier. */
  qty: string
}

/**
 * Row-shaped offer for the "Add to Your Purchase" screen — an item and a
 * quantity rather than a titled bundle, priced per row.
 */
export interface UpsellRowOffer {
  id: string
  name: string
  qty: string
  icon: string
  wasPrice: number
}
