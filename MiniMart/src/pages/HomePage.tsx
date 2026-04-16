import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductCard from '../components/product/ProductCard'
import heroBackground from '../assets/grocery-hero.jpg'
import '../css/HomePage.css'

type CategoryCard = {
  title: string
  text: string
  icon: string
  style: CSSProperties
}

const categoryIcons: Record<string, string> = {
  Vegetables: '\u{1F96C}',
  Fruits: '\u{1F34E}',
  Dairy: '\u{1F95B}',
  Bakery: '\u{1F950}',
  Pantry: '\u{1F6D2}',
  Snacks: '\u{1F36A}',
  Meat: '\u{1F969}',
  Beverages: '\u{1F964}',
  Drinks: '\u{1F964}'
}

const fallbackCategoryNames = [
  'Bakery',
  'Dairy',
  'Drinks',
  'Fruits',
  'Meat',
  'Pantry',
  'Snacks',
  'Vegetables'
]

const categoryMeta: Record<
  string,
  {
    text: string
    accent: string
    accentSoft: string
  }
> = {
  Bakery: {
    text: 'Warm bakes and morning favorites',
    accent: '#b86a3d',
    accentSoft: '#f8ece3'
  },
  Dairy: {
    text: 'Chilled basics and creamy staples',
    accent: '#5f8dcf',
    accentSoft: '#eaf2ff'
  },
  Drinks: {
    text: 'Cold refreshers and everyday sips',
    accent: '#c54f9b',
    accentSoft: '#fae8f4'
  },
  Beverages: {
    text: 'Cold refreshers and everyday sips',
    accent: '#c54f9b',
    accentSoft: '#fae8f4'
  },
  Fruits: {
    text: 'Sweet picks for snacking and juice',
    accent: '#cf4f5f',
    accentSoft: '#fdebed'
  },
  Meat: {
    text: 'Fresh cuts for dinner and grilling',
    accent: '#cd5a5a',
    accentSoft: '#fdecea'
  },
  Pantry: {
    text: 'Stock up on everyday cupboard staples',
    accent: '#5a89a8',
    accentSoft: '#e8f2f7'
  },
  Snacks: {
    text: 'Crunchy, sweet, and easy to grab',
    accent: '#b67843',
    accentSoft: '#f8eee3'
  },
  Vegetables: {
    text: 'Leafy greens and everyday freshness',
    accent: '#6c9640',
    accentSoft: '#edf5e4'
  }
}

function buildCategoryCard(title: string): CategoryCard {
  const meta = categoryMeta[title] ?? {
    text: `Browse ${title.toLowerCase()}`,
    accent: '#1b6b59',
    accentSoft: '#ecf4f1'
  }

  return {
    title,
    text: meta.text,
    icon: categoryIcons[title] ?? '\u{1F6D2}',
    style: {
      '--category-accent': meta.accent,
      '--category-soft': meta.accentSoft
    } as CSSProperties
  }
}

export default function HomePage() {
  const { products, loading, error } = useProducts()
  const { categories: dbCategories } = useCategories()
  const { addToCart } = useCart()

  const categories: CategoryCard[] =
    dbCategories.length > 0
      ? dbCategories.map((category) => buildCategoryCard(category.name))
      : fallbackCategoryNames.map((categoryName) => buildCategoryCard(categoryName))

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
              <Link
                to={`/catalog?category=${encodeURIComponent(category.title)}`}
                className="category-tile"
                key={category.title}
                style={category.style}
              >
                <span className="category-icon" aria-hidden="true">
                  {category.icon}
                </span>

                <div className="category-copy">
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                </div>

                <span className="category-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 16L16 8M10 8H16V14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading-row">
            <div>
              <h2>Built for everyday groceries</h2>
              <p className="home-section-copy">
                MiniMart gives you a fast shopping experience with product discovery, cart management,
                and built-in customer support.
              </p>
            </div>
          </div>

          <div className="home-banner-grid">
            <div className="home-banner-card dark">
              <h3>Fresh products in one place</h3>
              <p>
                Browse fresh produce, dairy, bakery items, beverages, and more. Everything is easy to
                explore with category tiles and helpful product details.
              </p>
            </div>

            <div className="home-banner-card light">
              <h3>Need help or want to collaborate?</h3>
              <p>
                Send us a message through the contact page and we&apos;ll respond from the admin
                dashboard. Your feedback helps us improve the shopping experience.
              </p>
              <Link to="/contact" className="section-link home-banner-link">
                Contact us
              </Link>
            </div>
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
