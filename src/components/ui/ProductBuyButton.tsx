import type { Product } from '../../types'
import { getPurchaseState } from './purchase'
import './ProductBuyButton.css'

const UNAVAILABLE_LABEL = {
  soldOut: 'Sold out',
  comingSoon: 'Coming soon',
} as const

export function ProductBuyButton({ product }: { product: Product }) {
  const state = getPurchaseState(product)

  if (state.kind === 'none') return null

  if (state.kind === 'buy') {
    // Same tab on purpose: checkout stays one tab, and the browser's Back
    // button returns the buyer to this page.
    return (
      <div className="product-buy">
        <a className="product-buy-button" href={state.href}>
          Buy now
        </a>
        <p className="product-buy-note">Secure checkout on Stripe</p>
      </div>
    )
  }

  return (
    <div className="product-buy">
      <button type="button" className="product-buy-button" disabled>
        {UNAVAILABLE_LABEL[state.kind]}
      </button>
    </div>
  )
}
