import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import products from '../src/assets/data/products.json'
import { getPurchaseState, isLiveCheckoutUrl } from '../src/components/ui/purchase.ts'
import { ProductBuyButton } from '../src/components/ui/ProductBuyButton.tsx'

const HAT_LINK = 'https://buy.stripe.com/bJe8wPd5D9MKbUV7lH5sA01'

const product = (overrides = {}) => ({
  id: 'thing',
  name: 'Thing',
  price: 10,
  category: 'apparel',
  images: [],
  specs: {},
  description: '',
  ...overrides,
})

describe('isLiveCheckoutUrl', () => {
  it("accepts Khari's live-mode Payment Link", () => {
    expect(isLiveCheckoutUrl(HAT_LINK)).toBe(true)
  })

  it('accepts a Payment Link carrying prefill query params', () => {
    expect(isLiveCheckoutUrl(`${HAT_LINK}?prefilled_promo_code=LOB10`)).toBe(true)
  })

  it('rejects a test-mode link, which would refuse every real card', () => {
    expect(isLiveCheckoutUrl('https://buy.stripe.com/test_bJe8wPd5D9MKbUV7lH5sA01')).toBe(false)
  })

  it('rejects plain http', () => {
    expect(isLiveCheckoutUrl('http://buy.stripe.com/bJe8wPd5D9MKbUV7lH5sA01')).toBe(false)
  })

  it('rejects any host that is not Stripe checkout', () => {
    expect(isLiveCheckoutUrl('https://evil.example/bJe8wPd5D9MKbUV7lH5sA01')).toBe(false)
    expect(isLiveCheckoutUrl('https://buy.stripe.com.evil.example/bJe8wPd5D9MKbUV7lH5sA01')).toBe(false)
    expect(isLiveCheckoutUrl('https://dashboard.stripe.com/bJe8wPd5D9MKbUV7lH5sA01')).toBe(false)
  })

  it('rejects a bare host or a nested path', () => {
    expect(isLiveCheckoutUrl('https://buy.stripe.com/')).toBe(false)
    expect(isLiveCheckoutUrl('https://buy.stripe.com/abc/def')).toBe(false)
  })

  it('rejects non-URLs without throwing', () => {
    expect(isLiveCheckoutUrl('')).toBe(false)
    expect(isLiveCheckoutUrl('buy.stripe.com/abc')).toBe(false)
    expect(isLiveCheckoutUrl('javascript:alert(1)')).toBe(false)
    expect(isLiveCheckoutUrl(undefined)).toBe(false)
    expect(isLiveCheckoutUrl(null)).toBe(false)
    expect(isLiveCheckoutUrl(42)).toBe(false)
  })
})

describe('getPurchaseState', () => {
  it('offers checkout when the product has a live link', () => {
    expect(getPurchaseState(product({ checkoutUrl: HAT_LINK }))).toEqual({ kind: 'buy', href: HAT_LINK })
  })

  it('reports sold out even when a link is still set', () => {
    expect(getPurchaseState(product({ checkoutUrl: HAT_LINK, soldOut: true }))).toEqual({ kind: 'soldOut' })
  })

  it('reports coming soon even when a link is already set', () => {
    expect(getPurchaseState(product({ checkoutUrl: HAT_LINK, comingSoon: true }))).toEqual({ kind: 'comingSoon' })
  })

  it('prefers sold out when both flags are set', () => {
    expect(getPurchaseState(product({ soldOut: true, comingSoon: true }))).toEqual({ kind: 'soldOut' })
  })

  it('offers nothing when there is no link', () => {
    expect(getPurchaseState(product())).toEqual({ kind: 'none' })
  })

  it('offers nothing rather than a broken checkout when the link is not live', () => {
    expect(getPurchaseState(product({ checkoutUrl: 'https://buy.stripe.com/test_abc' }))).toEqual({ kind: 'none' })
  })
})

describe('ProductBuyButton', () => {
  const render = (p) => renderToStaticMarkup(createElement(ProductBuyButton, { product: p }))

  it('links straight to the Payment Link in the same tab', () => {
    const html = render(product({ checkoutUrl: HAT_LINK }))
    expect(html).toContain(`href="${HAT_LINK}"`)
    expect(html).not.toContain('target=')
    expect(html).toContain('Buy now')
  })

  it('tells the buyer they are heading to Stripe', () => {
    expect(render(product({ checkoutUrl: HAT_LINK }))).toContain('Stripe')
  })

  it('renders sold out as a disabled control with no link', () => {
    const html = render(product({ checkoutUrl: HAT_LINK, soldOut: true }))
    expect(html).toContain('Sold out')
    expect(html).toMatch(/<button[^>]*\bdisabled\b/)
    expect(html).not.toContain('href=')
  })

  it('renders coming soon as a disabled control with no link', () => {
    const html = render(product({ comingSoon: true }))
    expect(html).toContain('Coming soon')
    expect(html).toMatch(/<button[^>]*\bdisabled\b/)
    expect(html).not.toContain('href=')
  })

  it('renders nothing for a product that cannot be bought', () => {
    expect(render(product())).toBe('')
  })
})

describe('products.json', () => {
  it('gives every product a unique, URL-safe id (it is the /shop/:id route)', () => {
    const ids = products.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('only ever points checkout at a live Stripe Payment Link', () => {
    for (const p of products.filter((p) => 'checkoutUrl' in p)) {
      expect(isLiveCheckoutUrl(p.checkoutUrl), `${p.id}: ${p.checkoutUrl}`).toBe(true)
    }
  })

  it('references only images that exist in public/', () => {
    for (const p of products) {
      for (const img of p.images) {
        expect(existsSync(new URL(`../public/${img}`, import.meta.url)), `${p.id}: ${img}`).toBe(true)
      }
    }
  })

  it('sells the Wild Rozanna hat for $50 through its Payment Link', () => {
    const hat = products.find((p) => p.id === 'wild-rozanna')
    expect(hat).toBeDefined()
    expect(hat.price).toBe(50)
    expect(getPurchaseState(hat)).toEqual({ kind: 'buy', href: HAT_LINK })
  })

  // Launch gate: nobody should be asked for $50 next to a grey box. Expected
  // to fail until the hat photos are in public/shop/.
  it('gives every buyable product at least one photo', () => {
    for (const p of products.filter((p) => getPurchaseState(p).kind === 'buy')) {
      expect(p.images.length, `${p.id} has no photo`).toBeGreaterThan(0)
    }
  })
})
