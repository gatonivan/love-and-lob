import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useBottomScroll } from '../../hooks/useBottomScroll'
import type { Product } from '../../types'
import productsData from '../../assets/data/products.json'
import './ProductDetail.css'

const products = productsData as unknown as Product[]
const BASE = import.meta.env.BASE_URL

function getPlaceholderColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 15%, 18%)`
}

export function ProductDetail() {
  useBottomScroll(true)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [exiting, setExiting] = useState(false)
  const product = products.find((p) => p.id === id)

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setExiting(true)
    setTimeout(() => {
      navigate('/shop')
    }, 300)
  }, [navigate])

  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail-inner">
          <a href="/shop" className="product-detail-back" onClick={handleBack}>&larr; Back to Shop</a>
          <h1>Product not found</h1>
        </div>
      </div>
    )
  }

  const bgColor = getPlaceholderColor(product.id)

  return (
    <div className={`product-detail${exiting ? ' product-detail--exiting' : ''}`}>
      <div className="product-detail-inner">
        <a href="/shop" className="product-detail-back" onClick={handleBack}>
          &larr; Back to Shop
        </a>

        <div className="product-detail-layout">
          {/* Image gallery */}
          <div className="product-detail-gallery">
            <div className="product-detail-hero-image" style={{ background: bgColor }}>
              {product.images.length > 0 ? (
                <img src={`${BASE}${product.images[0]}`} alt={product.name} />
              ) : (
                <span className="product-detail-placeholder">{product.category}</span>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            {product.priceOptions ? (
              <div className="product-detail-price-select">
                <select
                  className="product-detail-dropdown"
                  value={selectedPrice ?? product.priceOptions[0]}
                  onChange={(e) => setSelectedPrice(Number(e.target.value))}
                >
                  {product.priceOptions.map((amt) => (
                    <option key={amt} value={amt}>${amt}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="product-detail-price">${product.price}</div>
            )}
            <p className="product-detail-description">{product.description}</p>

            {/* Specs in monospace — the MSCHF touch */}
            <div className="product-detail-specs">
              <h3 className="product-detail-specs-title">Specifications</h3>
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="product-detail-spec-row">
                  <span className="product-detail-spec-key">{key}</span>
                  <span className="product-detail-spec-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
