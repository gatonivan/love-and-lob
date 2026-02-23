export interface Product {
  id: string
  name: string
  price: number
  category: 'apparel' | 'accessories' | 'equipment'
  images: string[]
  specs: Record<string, string>
  description: string
}
