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
              A friendly grocery storefront with product browsing, cart management, order tracking,
              and admin tools for inventory and order control.
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
          <p>© {new Date().getFullYear()} MiniMart.</p>
          <div className="footer-bottom-links">
            <Link to="/">Privacy</Link>
            <span>•</span>
            <Link to="/">Support</Link>
          </div>
        </div>
      </section>
    </footer>
  )
}