import type { MultiOffer } from '../playground/types'

/**
 * Prices are authored as display strings ("$4.99"), so strip everything that
 * isn't part of the number before summing.
 */
function parsePrice(price: string): number {
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/**
 * Multi-offer totals come from the offers themselves rather than the single-offer
 * `products.subtotal`, so editing an offer's price moves the summary with it.
 * Every listed offer counts once — `qty` is the badge on the thumbnail, not a
 * line-item multiplier.
 */
export function multiOfferPricing(
  offers: MultiOffer[] | undefined,
  taxPercent: number,
  promoDiscount: number,
) {
  const subtotal = (offers ?? []).reduce((sum, o) => sum + parsePrice(o.price), 0)
  const taxAmount = subtotal * (taxPercent / 100)
  return {
    subtotal,
    taxAmount,
    total: Math.max(0, subtotal + taxAmount - promoDiscount),
  }
}
