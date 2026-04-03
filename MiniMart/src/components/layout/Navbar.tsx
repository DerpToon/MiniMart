import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from '../../hooks/useProfile';
import '../../css/Navbar.css'

function Navbar() {
    const { user, signOut } = useAuth()
    const { profile } = useProfile()

    async function handleSignOut() {
        try {
            await signOut()
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <nav className="navbar">
                <div className="navbar__left">
                    <Link to="/" className="navbar__logo">
                        MiniMart
                    </Link>

                    <div className="navbar__links">
                        <Link to="/">Home</Link>
                        <Link to="/catalog">Catalog</Link>

                        {user && (
                            <>
                                <Link to="/cart">Cart</Link>
                                <Link to="/orders">My Orders</Link>
                            </>
                        )}

                        {profile?.role === 'admin' && (
                            <>
                                <Link to="/admin/products">Admin Products</Link>
                                <Link to="/admin/orders">Admin Orders</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="navbar__right">
                    {user ? (
                        <>
                            <span className="navbar__user">{user.email}</span>
                            <button className="navbar__button" onClick={handleSignOut}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar__button navbar__button--link">
                                Login
                            </Link>
                            <Link to="/register" className="navbar__button navbar__button--primary">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </>
    )
}

export default Navbar;