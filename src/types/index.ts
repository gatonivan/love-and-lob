export interface Product {
  id: string
  name: string
  price: number
  priceOptions?: number[]
  category: 'apparel' | 'accessories' | 'equipment'
  images: string[]
  specs: Record<string, string>
  description: string
  soldOut?: boolean
  comingSoon?: boolean
  /** Live Stripe Payment Link (https://buy.stripe.com/…). Absent = not for sale online. */
  checkoutUrl?: string
}
