import { useCart } from '../hooks/useCart'; // Adjust path
import { useProducts } from '../hooks/useProducts'; // Adjust path
import ProductCard from '../components/product/ProductCard'; // Adjust path to the new component
import '../css/CatalogPage.css';

export default function CatalogPage() {
    const { products, loading, error } = useProducts();
    const { addToCart } = useCart();

    // Reusing the exact same type logic to prevent TypeScript errors
    function handleAddToCart(product: {
        id: string | number;
        name: string;
        price: number;
        image_url?: string | null;
        stock_quantity: number;
    }) {
        if (product.stock_quantity <= 0) return;

        addToCart({
            product_id: String(product.id),
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url || null
        });
    }

    // Loading State
    if (loading) {
        return (
            <div className="catalog-page">
                <div className="catalog-status-container">
                    <p>Loading fresh products...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="catalog-page">
                <div className="catalog-status-container error">
                    <p>⚠️ {error}</p>
                </div>
            </div>
        );
    }

    return (
        <section className="catalog-page">
            <div className="catalog-container">
                
                {/* Header and Filters */}
                <div className="catalog-header-bar">
                    <div>
                        <h1 className="catalog-title">All Categories</h1>
                        <p className="catalog-subtitle">Browse our fresh selection and add to your cart.</p>
                    </div>
                    <div className="catalog-filters">
                        <select className="filter-dropdown">
                            <option>Sort by: Featured</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid mapping over our new Reusable Component */}
                <div className="catalog-grid">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAddToCart={handleAddToCart} 
                            />
                        ))
                    ) : (
                        <p className="no-products-message">No products found in the catalog.</p>
                    )}
                </div>
                
            </div>
        </section>
    );
}