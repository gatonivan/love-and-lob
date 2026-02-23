import { useParams, Link } from 'react-router'
import type { Product } from '../../types'
import productsData from '../../assets/data/products.json'
import './ProductDetail.css'

const products = productsData as unknown as Product[]

function getPlaceholderColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 15%, 18%)`
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail-inner">
          <Link to="/shop" className="product-detail-back">Back to Shop</Link>
          <h1>Product not found</h1>
        </div>
      </div>
    )
  }

  const bgColor = getPlaceholderColor(product.id)

  return (
    <div className="product-detail">
      <div className="product-detail-inner">
        <Link to="/shop" className="product-detail-back">
          Back to Shop
        </Link>

        <div className="product-detail-layout">
          {/* Image gallery */}
          <div className="product-detail-gallery">
            <div className="product-detail-hero-image" style={{ background: bgColor }}>
              {product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <span className="product-detail-placeholder">{product.category}</span>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-price">${product.price}</div>
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
