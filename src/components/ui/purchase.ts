import type { Product } from '../../types'

// Checkout is a Stripe Payment Link that Khari builds in the Stripe dashboard;
// the site only links out to it. Only a live-mode link on Stripe's own
// checkout host counts. A test-mode link (`/test_…`) would send a real
// customer to a checkout that refuses every real card, and anything else is
// not a checkout at all. If Payment Links ever move to a custom domain, add
// it here and to the tests in the same change.
const CHECKOUT_HOST = 'buy.stripe.com'
const LIVE_LINK_PATH = /^\/(?!test_)[A-Za-z0-9]+$/

export function isLiveCheckoutUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  return (
    parsed.protocol === 'https:' &&
    parsed.hostname === CHECKOUT_HOST &&
    LIVE_LINK_PATH.test(parsed.pathname)
  )
}

export type PurchaseState =
  | { kind: 'buy'; href: string }
  | { kind: 'soldOut' }
  | { kind: 'comingSoon' }
  | { kind: 'none' }

export function getPurchaseState(product: Product): PurchaseState {
  if (product.soldOut) return { kind: 'soldOut' }
  if (product.comingSoon) return { kind: 'comingSoon' }
  if (product.checkoutUrl && isLiveCheckoutUrl(product.checkoutUrl)) {
    return { kind: 'buy', href: product.checkoutUrl }
  }
  return { kind: 'none' }
}
