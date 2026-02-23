import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ProductCard } from './ProductCard'
import type { Product } from '../../types'
import productsData from '../../assets/data/products.json'
import './ShopGrid.css'

const products = productsData as unknown as Product[]

export function ShopGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.product-card')

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
      }
    )
  }, [])

  return (
    <div className="shop">
      <div className="shop-header">
        <h1 className="shop-title">Shop</h1>
        <div className="shop-filters">
          <span className="shop-count">{products.length} items</span>
        </div>
      </div>
      <div ref={gridRef} className="shop-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
