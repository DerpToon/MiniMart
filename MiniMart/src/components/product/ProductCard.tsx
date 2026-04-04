import '../../css/ProductCard.css'; // Adjust path as needed

// 1. Export the type so you can use it in other files!
export interface Product {
    id: string | number;
    name: string;
    price: number;
    stock_quantity: number;
    image_url?: string | null;
    weight?: string; // Optional, nice to have
    category?: string; // Optional
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const isOutOfStock = product.stock_quantity <= 0;
    
    // Safely format the price to always show 2 decimals
    const priceStr = product.price ? product.price.toFixed(2) : "0.00";
    const [dollars, cents] = priceStr.split('.');

    return (
        <article className="shared-product-card group">
            {/* Out of Stock Badge */}
            {isOutOfStock && <span className="card-badge out-of-stock">Sold Out</span>}

            {/* Image Area */}
            <div className="card-image-wrapper">
                <img
                    src={product.image_url || 'https://via.placeholder.com/200?text=📦'}
                    alt={product.name}
                    className="card-image"
                />
            </div>

            {/* Product Details */}
            <div className="card-info">
                <span className="card-category">{product.category || 'Fresh Market'}</span>
                
                {/* Title is clamped to 2 lines so cards stay the same height */}
                <h3 className="card-title" title={product.name}>
                    {product.name}
                </h3>
                
                <p className="card-weight">{product.weight || '1 item'}</p>

                {/* Footer: Price and Add Button */}
                <div className="card-bottom">
                    <div className="card-price">
                        <span className="currency">$</span>
                        <span className="dollars">{dollars}</span>
                        <span className="cents">{cents}</span>
                    </div>

                    <button
                        className="card-add-btn"
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        aria-label="Add to cart"
                    >
                        {isOutOfStock ? '×' : '+'}
                    </button>
                </div>
            </div>
        </article>
    );
}