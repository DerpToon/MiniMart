import '../../css/ProductCard.css'

export interface Product {
  id: string | number
  name: string
  price: number
  stock_quantity: number
  image_url?: string | null
  weight?: string
  category?: string
}

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
        <img
          src={product.image_url || 'https://via.placeholder.com/400x300?text=MiniMart'}
          alt={product.name}
          className="product-card-image"
        />
      </div>

      <div className="product-card-content">
        <p className="product-card-kicker">{product.category || 'MiniMart pick'}</p>
        <h3 title={product.name}>{product.name}</h3>
        <p className="product-card-meta">{product.weight || `${product.stock_quantity} in stock`}</p>

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
