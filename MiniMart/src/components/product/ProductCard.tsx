import { Link } from 'react-router-dom'
import '../../css/ProductCard.css'
import type { Product } from '../../types/db'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock_quantity <= 0
  const formattedPrice = product.price.toFixed(2)

  return (
    <article className="product-card-modern">
      <div className="product-card-media">
        {outOfStock && <span className="product-status sold-out">Sold out</span>}
        {!outOfStock && product.stock_quantity <= 8 && (
          <span className="product-status low-stock">Low stock</span>
        )}
        <Link to={`/products/${product.id}`} className="product-card-media-link">
          <img
            src={product.image_url || 'https://via.placeholder.com/400x300?text=MiniMart'}
            alt={product.name}
            className="product-card-image"
          />
        </Link>
      </div>

      <div className="product-card-content">
        <Link to={`/products/${product.id}`} className="product-card-info-link">
          <p className="product-card-kicker">{product.category?.name || 'MiniMart pick'}</p>
          <h3 title={product.name}>{product.name}</h3>
          <p className="product-card-meta">
            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
          </p>
        </Link>

        <div className="product-card-footer">
          <div className="product-card-price">${formattedPrice}</div>
          <button
            className="product-add-button"
            type="button"
            disabled={outOfStock}
            onClick={() => onAddToCart(product)}
          >
            {outOfStock ? 'Unavailable' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}
