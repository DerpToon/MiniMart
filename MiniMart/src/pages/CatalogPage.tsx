import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import '../css/CatalogPage.css'

export default function CatalogPage() {
  const { products, loading, error } = useProducts()
  const { addToCart } = useCart()

  function handleAddToCart(product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock_quantity: number
  }) {
    if (product.stock_quantity <= 0) return

    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url
    })
  }

  if (loading) {
    return <p className="catalog-status">Loading products...</p>
  }

  if (error) {
    return <p className="catalog-status catalog-error">{error}</p>
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <h1 className="catalog-title">Product Catalog</h1>
        <p className="catalog-subtitle">Browse products and add them to your cart.</p>
      </div>

      <div className="catalog-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-image-wrapper">
              <img
                className="product-image"
                src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
              />
            </div>

            <div className="product-content">
              <h2 className="product-name">{product.name}</h2>

              <p className="product-description">
                {product.description || 'No description available.'}
              </p>

              <div className="product-meta">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <span
                  className={
                    product.stock_quantity > 0
                      ? 'product-stock in-stock'
                      : 'product-stock out-of-stock'
                  }
                >
                  {product.stock_quantity > 0
                    ? `In stock: ${product.stock_quantity}`
                    : 'Out of stock'}
                </span>
              </div>

              <button
                className="product-button"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock_quantity <= 0}
              >
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}