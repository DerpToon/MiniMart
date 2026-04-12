import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useCart } from '../../hooks/useCart'
import '../../css/Navbar.css'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const { cart } = useCart()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const avatarText = profile?.full_name?.trim()
    ? profile.full_name
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : user?.email?.charAt(0).toUpperCase() || 'U'

  async function handleSignOut() {
    try {
      await signOut()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="site-navbar">
      <div className="navbar-shell">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand" aria-label="MiniMart home">
            <div className="brand-mark">
              <img src="/logo.png" alt="MiniMart" className="brand-logo" />
            </div>

            <div>
              <span className="brand-title">MiniMart</span>
              <span className="brand-subtitle">Fresh. Fast. Simple.</span>
            </div>
          </Link>

          <nav className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>

            <NavLink to="/catalog" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              Catalog
            </NavLink>

            {user && (
              <NavLink to="/orders" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
                My Orders
              </NavLink>
            )}
          </nav>
        </div>

        <div className="navbar-right">
          <div className="navbar-search-shell">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search products..."
              aria-label="Search"
            />
          </div>

          {user ? (
            <Link to="/cart" className="cart-button" aria-label="Go to cart">
              <span className="cart-emoji">🛒</span>
              <span className="cart-label">Cart</span>
              {totalCartItems > 0 && <span className="cart-count">{totalCartItems}</span>}
            </Link>
          ) : null}

          <div
            className={`user-menu ${isDropdownOpen ? 'open' : ''}`}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            {user ? (
              <button className="user-avatar" type="button" aria-label="Open profile menu">
                {avatarText}
              </button>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="ghost-button">
                  Login
                </Link>

                <Link to="/register" className="primary-button small">
                  Sign up
                </Link>
              </div>
            )}

            {user && isDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-user-meta">
                  <strong>{profile?.full_name || user.email}</strong>
                  <span>{profile?.role === 'admin' ? 'Administrator' : 'Customer account'}</span>
                </div>

                <div className="dropdown-links">
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>

                  <Link to="/orders" onClick={() => setIsDropdownOpen(false)}>
                    My Orders
                  </Link>

                  <Link to="/catalog" onClick={() => setIsDropdownOpen(false)}>
                    Browse Catalog
                  </Link>

                  {profile?.role === 'admin' && (
                    <>
                      <div className="dropdown-section-label">Admin</div>

                      <Link to="/admin/products" onClick={() => setIsDropdownOpen(false)}>
                        Manage Inventory
                      </Link>

                      <Link to="/admin/orders" onClick={() => setIsDropdownOpen(false)}>
                        Manage Orders
                      </Link>

                      <Link to="/admin/users" onClick={() => setIsDropdownOpen(false)}>
                        Manage Users
                      </Link>
                    </>
                  )}

                  <button onClick={handleSignOut} type="button">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
