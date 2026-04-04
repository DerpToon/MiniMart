import { Link } from 'react-router-dom';
import '../../css/Footer.css'; // Adjust path depending on where you save this!

export default function Footer() {
    return (
        <footer className="footer-modern">
            {/* Top Light Green Banner - Trust Features */}
            <div className="footer-feature-banner">
                <div className="footer-container feature-grid">
                    <div className="feature-item">
                        <div className="feature-icon">🎁</div>
                        <h3>MiniMart Vouchers</h3>
                        <p>Perfect for everyday gifts</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🛡️</div>
                        <h3>Secure Payments</h3>
                        <p>100% safe & secure transactions</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">📱</div>
                        <h3>Mobile App</h3>
                        <p>Shop on the go effortlessly</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🚚</div>
                        <h3>Fast Delivery</h3>
                        <p>Order now, get it in 15 mins</p>
                    </div>
                </div>
            </div>

            {/* Main Dark Footer */}
            <div className="footer-main">
                <div className="footer-container footer-grid">
                    
                    {/* Brand Info Column */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            {/* If you have a logo.png in your public folder */}
                            <img src="/logo.png" alt="MiniMart" />
                            <span>MiniMart</span>
                        </div>
                        <p className="footer-desc">
                            Delivering excellence in fresh produce, everyday essentials, and frictionless shopping experiences directly to your door.
                        </p>
                        <div className="payment-methods">
                            <span>Accepted Payments:</span>
                            <div className="card-icons">
                                <span className="card-badge">VISA</span>
                                <span className="card-badge">MASTERCARD</span>
                                <span className="card-badge">PAYPAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Column 1 */}
                    <div className="footer-links">
                        <h4>Department</h4>
                        <Link to="/catalog">Fresh Produce</Link>
                        <Link to="/catalog">Dairy & Milk</Link>
                        <Link to="/catalog">Snacks & Breads</Link>
                        <Link to="/catalog">Frozen Foods</Link>
                        <Link to="/catalog">Meat & Seafood</Link>
                    </div>

                    {/* Quick Links Column 2 */}
                    <div className="footer-links">
                        <h4>About Us</h4>
                        <Link to="/">About MiniMart</Link>
                        <Link to="/">Careers</Link>
                        <Link to="/">News & Blog</Link>
                        <Link to="/">Store Locations</Link>
                        <Link to="/">Affiliate Program</Link>
                    </div>

                    {/* Quick Links Column 3 */}
                    <div className="footer-links">
                        <h4>Help & Support</h4>
                        <Link to="/">Help Center</Link>
                        <Link to="/">Returns & Refunds</Link>
                        <Link to="/orders">Track Your Order</Link>
                        <Link to="/">Contact Us</Link>
                        <Link to="/">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="footer-bottom">
                <div className="footer-container bottom-flex">
                    <p>&copy; {new Date().getFullYear()} MiniMart. All rights reserved.</p>
                    <div className="bottom-links">
                        <Link to="/">Privacy Policy</Link>
                        <span className="divider">•</span>
                        <Link to="/">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}