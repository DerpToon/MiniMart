import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from '../../hooks/useProfile';
import { useCart } from '../../hooks/useCart'; // Added Cart Hook
import '../../css/Navbar.css';

function Navbar() {
    const { user, signOut } = useAuth();
    const { profile } = useProfile();
    
    // FIX: Pulling in 'cart' instead of 'cartItems' to match your hook!
    const { cart } = useCart(); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // FIX: Calculate total items using 'cart'
    const totalCartItems = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

    async function handleSignOut() {
        try {
            await signOut();
            setIsDropdownOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <header className="navbar-modern">
            {/* Top Bar (Dark Theme) */}
            <div className="navbar-top">
                <div className="navbar-container">
                    
                    {/* Left: Hamburger & Logo */}
                    <div className="navbar-brand">
                        <Link to="/" className="logo-link">
                            <img src="/logo.png" alt="MiniMart" className="brand-logo" />
                            <span className="brand-text">MiniMart</span>
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="navbar-search-wrapper">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search for Grocery, Stores, Vegetable or Meat..." 
                        />
                        <button className="search-submit">🔍</button>
                    </div>

                    {/* Right: Delivery Info, Cart, and User */}
                    <div className="navbar-actions">
                        <div className="delivery-banner hidden-mobile">
                            <span className="lightning">⚡</span> Order now and get it within 15 mins!
                        </div>

                        {user && (
                            <Link to="/cart" className="cart-icon-wrapper">
                                🛒
                                {/* Dynamic Badge: Only shows if there are items */}
                                {totalCartItems > 0 && (
                                    <span className="cart-badge">{totalCartItems}</span>
                                )}
                            </Link>
                        )}

                        <div 
                            className="user-profile-menu"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            {user ? (
                                <div className="user-avatar">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <Link to="/login" className="btn-login">Login</Link>
                                    <Link to="/register" className="btn-register">Sign Up</Link>
                                </div>
                            )}

                            {/* Dropdown for Logged in Users */}
                            {user && isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <p className="user-email-text">{user.email}</p>
                                    </div>
                                    <div className="dropdown-links">
                                        <Link to="/orders">My Orders</Link>
                                        <button onClick={handleSignOut} className="btn-logout">Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar (Links & Admin controls) */}
            <div className="navbar-bottom">
                <div className="navbar-container">
                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/catalog" className="nav-link">Catalog</Link>
                        
                        {user && (
                            <Link to="/orders" className="nav-link mobile-only">My Orders</Link>
                        )}

                        {profile?.role === 'admin' && (
                            <div className="admin-links">
                                <span className="divider">|</span>
                                <span className="admin-badge">Admin Controls:</span>
                                <Link to="/admin/products" className="nav-link admin">Products</Link>
                                <Link to="/admin/orders" className="nav-link admin">Orders</Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Navbar;