import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'
import heroBackground from '../assets/grocery-hero.jpg'
import '../css/HomePage.css'

const categories = [
  { title: 'Vegetables', text: 'Fresh greens and everyday essentials', icon: '🥬' },
  { title: 'Fruits', text: 'Sweet, healthy and ready to deliver', icon: '🍎' },
  { title: 'Dairy', text: 'Milk, cheese and chilled basics', icon: '🥛' },
  { title: 'Bakery', text: 'Breads and snacks for quick orders', icon: '🥐' }
]

export default function HomePage() {
  const { products, loading, error } = useProducts()
  const { addToCart } = useCart()

  function handleAddToCart(product: {
    id: string | number
    name: string
    price: number
    image_url?: string | null
    stock_quantity: number
  }) {
    if (product.stock_quantity <= 0) return

    addToCart({
      product_id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || null
    })
  }

  const featuredProducts = products.slice(0, 8)

  return (
    <div className="home-page">
      <div className="home-container">
        <section
          className="hero-panel"
          style={{
            backgroundImage: `linear-gradient(
              90deg,
              rgba(7, 27, 23, 0.88) 0%,
              rgba(10, 38, 32, 0.76) 34%,
              rgba(12, 45, 37, 0.42) 62%,
              rgba(12, 45, 37, 0.16) 100%
            ), url(${heroBackground})`
          }}
        >
          <div className="hero-copy">
            <h1>Fresh shopping made simple, quick, and easy to use.</h1>

            <p>
              Browse products, add them to cart, place orders, and manage inventory in a cleaner,
              more modern grocery app.
            </p>

            <div className="hero-actions">
              <Link to="/catalog" className="hero-primary-btn">
                Shop now
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading-row">
            <div>
              <h2>Shop by what you need</h2>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-tile" key={category.title}>
                <span className="category-icon">{category.icon}</span>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading-row">
            <div>
              <h2>Popular picks from your catalog</h2>
            </div>

            <Link to="/catalog" className="section-link">
              View all products
            </Link>
          </div>

          {loading && <div className="section-state">Loading products...</div>}
          {error && <div className="section-state error">Failed to load products: {error}</div>}

          {!loading && !error && (
            <div className="home-product-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))
              ) : (
                <div className="section-state">No products found yet.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}