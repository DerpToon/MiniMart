import { Link } from "react-router-dom"
function Navbar() {
    return (
        <>
            <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
                <Link to="/">Home</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/orders">Orders</Link>
                <Link to="/catalog">Catalog</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </nav>
        </>
    )
}

export default Navbar;