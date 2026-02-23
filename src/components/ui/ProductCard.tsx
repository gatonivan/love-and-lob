import { Link } from 'react-router'
import type { Product } from '../../types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

// Generate a deterministic color from product ID for placeholder
function getPlaceholderColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 15%, 18%)`
}

export function ProductCard({ product }: ProductCardProps) {
  const bgColor = getPlaceholderColor(product.id)

  return (
    <Link to={`/shop/${product.id}`} className="product-card">
      <div className="product-card-image" style={{ background: bgColor }}>
        {product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <span className="product-card-placeholder">{product.category}</span>
        )}
      </div>
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <span className="product-card-price">${product.price}</span>
      </div>
      <div className="product-card-specs">
        {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
          <span key={key} className="product-card-spec">
            {key}: {val}
          </span>
        ))}
      </div>
    </Link>
  )
}
