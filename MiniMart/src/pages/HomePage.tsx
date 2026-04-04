import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart'; // Adjust path if needed
import { useProducts } from '../hooks/useProducts'; // Adjust path if needed
import ProductCard from '../components/product/ProductCard'; // Adjust path to where you saved the ProductCard
import '../css/HomePage.css';

export default function HomePage() {
    // 1. Pull in real data and cart logic
    const { products, loading, error } = useProducts();
    const { addToCart } = useCart();

    // 2. Exact same Cart logic from CatalogPage
    function handleAddToCart(product: {
        id: string | number;
        name: string;
        price: number;
        image_url?: string | null;
        stock_quantity: number;
    }) {
        if (product.stock_quantity <= 0) return;

        addToCart({
            product_id: String(product.id), // Converted to string for safety
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url || null
        });
    }

    // Static UI Data for sections not in your database
    const categories = [
        { id: 1, name: 'Vegetable', desc: 'Local market', icon: '🥬' },
        { id: 2, name: 'Snacks & Breads', desc: 'In store delivery', icon: '🥐' },
        { id: 3, name: 'Fruits', desc: 'Chemical free', icon: '🥑' },
        { id: 4, name: 'Chicken legs', desc: 'Frozen Meal', icon: '🍗' },
        { id: 5, name: 'Milk & Dairy', desc: 'Process food', icon: '🥛' },
    ];

    const promos = [
        { id: 1, title: 'Save', amount: '$29', desc: 'Enjoy Discount all types', color: '#FDF0E9' },
        { id: 2, title: 'Discount', amount: '30%', desc: 'Enjoy Discount all types', color: '#FDF4E6' },
        { id: 3, title: 'Up to', amount: '50%', desc: 'Enjoy Discount all types', color: '#EAF3FA' },
        { id: 4, title: 'Free', amount: 'SHIP', desc: 'Enjoy Discount all types', color: '#F4E9F9' },
    ];

    // Grab only the first 6 products for the home page display
    const featuredProducts = products ? products.slice(0, 6) : [];

    return (
        <div className="home-page">
            <div className="home-container">
                
                {/* 1. Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>We bring the store<br/>to your door</h1>
                        <p>Get organic produce and sustainably sourced groceries delivery at up to 4% off grocery.</p>
                        <Link to="/catalog" className="btn-shop-now">Shop now</Link>
                    </div>
                    <div className="hero-image">
                        <div className="placeholder-bag" style={{ fontSize: '100px' }}>🛍️🛒</div>
                    </div>
                </section>

                {/* 2. Categories Section */}
                <section className="categories-section">
                    <div className="categories-scroll">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-card">
                                <div className="cat-info">
                                    <h4>{cat.name}</h4>
                                    <span>{cat.desc}</span>
                                </div>
                                <div className="cat-icon" style={{ fontSize: '24px' }}>{cat.icon}</div>
                            </div>
                        ))}
                        <div className="category-card see-all">
                            <div className="cat-icon-arrow">➔</div>
                            <h4>See all</h4>
                        </div>
                    </div>
                </section>

                {/* 3. Products Section ("You might need") */}
                <section className="products-section">
                    <div className="section-header">
                        <h2>You might need</h2>
                        <Link to="/catalog" className="see-more">See more →</Link>
                    </div>
                    
                    {/* Handle Loading & Error states gracefully */}
                    {loading && <div style={{textAlign: 'center', padding: '40px 0', color: '#666'}}>Loading fresh products...</div>}
                    {error && <div style={{textAlign: 'center', padding: '40px 0', color: '#FF4D4F'}}>Failed to load products.</div>}
                    
                    {!loading && !error && (
                        <div className="product-grid">
                            {featuredProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAddToCart={handleAddToCart} 
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* 4. Promo Banners */}
                <section className="promo-section">
                    {promos.map(promo => (
                        <div key={promo.id} className="promo-card" style={{ backgroundColor: promo.color }}>
                            <h3>{promo.title}</h3>
                            <h2>{promo.amount}</h2>
                            <p>{promo.desc}</p>
                        </div>
                    ))}
                </section>

                {/* 5. App Download Banner */}
                <section className="app-banner">
                    <div className="app-content">
                        <h2>Stay Home and Get All<br/>Your Essentials From<br/>Our Market!</h2>
                        <div className="app-buttons">
                            <button className="store-btn">Google Play</button>
                            <button className="store-btn">App Store</button>
                        </div>
                    </div>
                    <div className="app-image" style={{ fontSize: '120px' }}>
                        🛵
                    </div>
                </section>

            </div>
        </div>
    );
}