import { Link } from 'react-router-dom'
import '../css/AboutPage.css'

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-shell">
        <header className="about-hero">
          <p className="about-kicker">About MiniMart</p>
          <h1>Fresh groceries, fast delivery, and a simpler shopping experience.</h1>
          <p>
            MiniMart is built to make grocery shopping easy for customers and easy to manage for store
            owners. From browsing products to tracking orders and managing inventory, our goal is to
            simplify every step.
          </p>
          <Link to="/contact" className="about-hero-link">
            Send us a message
          </Link>
        </header>

        <div className="about-grid">
          <article className="about-card">
            <h2>Shop with confidence</h2>
            <p>
              Discover fresh produce, pantry staples and grocery essentials in a clean catalog layout.
              Every product card includes details, stock status, and quick access to the cart.
            </p>
          </article>

          <article className="about-card">
            <h2>Modern order flow</h2>
            <p>
              Customers can add items to cart, place orders, and review their history from their profile.
              Admins can confirm and fulfill orders from the dashboard.
            </p>
          </article>

          <article className="about-card">
            <h2>Customer support built in</h2>
            <p>
              Messages sent on the contact page appear in the admin users dashboard so the team can
              respond quickly and keep support organized.
            </p>
          </article>

          <article className="about-card">
            <h2>Admin controls</h2>
            <p>
              Admin users can manage inventory, orders, users, and now customer messages all from the
              dashboard.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
