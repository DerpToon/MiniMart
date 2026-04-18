import { Link } from 'react-router-dom'
import '../../css/Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <section className="footer-main">
        <div className="footer-inner footer-main-grid">
          <div className="footer-brand-block">
            <div className="footer-brand-row">
              <img src="/logo.png" alt="MiniMart" />
              <div>
                <h2>MiniMart</h2>
              </div>
            </div>

            <p className="footer-copy">
              Your neighborhood shop for fresh produce, pantry staples, bakery picks, and everyday
              essentials, ready whenever you need a quick and reliable grocery run.
            </p>
          </div>

          <div className="footer-links-block">
            <h4>Shop</h4>
            <Link to="/catalog">Catalog</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
          </div>

          <div className="footer-links-block">
            <h4>Quick links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </section>

      <section className="footer-bottom">
        <div className="footer-inner footer-bottom-row">
          <p>&copy; {new Date().getFullYear()} MiniMart.</p>
        </div>
      </section>
    </footer>
  )
}
