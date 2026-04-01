import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ProductCard } from './ProductCard'
import type { Product } from '../../types'
import productsData from '../../assets/data/products.json'
import sigrunLogo from '../../assets/affiliates/sigrun_wordlogo_black with blue dot.svg'
import furiLogo from '../../assets/affiliates/FURI WORDMARK LOGO IN BLACK.png'
import './ShopGrid.css'

const products = productsData as unknown as Product[]

interface Affiliate {
  name: string
  logo: string
  url: string
  bio: string
  code: string
}

const affiliates: Affiliate[] = [
  {
    name: 'Sigrún',
    logo: sigrunLogo,
    url: 'https://sigruntennis.com?sca_ref=9449197.F2gnjca7FySCr&utm_source=uppromote&utm_medium=affiliate&utm_campaign=khari-linton',
    bio: 'Sigrún® is a premium tennis and racquet sports apparel brand based in New York designed to keep your head in the match.',
    code: 'LOVELOB10',
  },
  {
    name: 'FURI',
    logo: furiLogo,
    url: 'https://furidesigns.com',
    bio: 'New York City born. FURI designs high-performance equipment. Engineered to perform. Designed to stand out.',
    code: '',
  },
]

export function ShopGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const affiliatesRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!affiliatesRef.current) return
    const cards = affiliatesRef.current.querySelectorAll('.affiliate-card')

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.3,
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

      <div className="affiliates-section">
        <div className="affiliates-header">
          <h2 className="affiliates-title">Love & Lob Affiliates</h2>
          <p className="affiliates-subtitle">Brands we love — use our codes for a discount</p>
        </div>
        <div ref={affiliatesRef} className="affiliates-grid">
          {affiliates.map((affiliate) => (
            <a
              key={affiliate.name}
              href={affiliate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="affiliate-card"
            >
              <div className="affiliate-logo-wrap">
                <img
                  src={affiliate.logo}
                  alt={affiliate.name}
                  className="affiliate-logo"
                />
              </div>
              <p className="affiliate-bio">{affiliate.bio}</p>
              {affiliate.code && (
                <div className="affiliate-code">
                  <span className="affiliate-code-label">Discount Code</span>
                  <span className="affiliate-code-value">{affiliate.code}</span>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
