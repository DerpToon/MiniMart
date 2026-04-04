import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import '../css/CartPage.css';

export default function CartPage() {
    const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getTotal } = useCart();
    
    // Using submitOrder from your hook
    const { submitOrder, loading, error } = useOrder();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            // 1. Calculate the final price (Subtotal + Shipping)
            const subtotal = getTotal();
            const shipping = subtotal > 50 ? 0 : 5.99;
            const finalTotal = subtotal + shipping;

            // 2. FIXED: Use submitOrder from the hook and pass finalTotal
            // This ensures the 'total' column in Supabase is filled
            const orderId = await submitOrder(cart, finalTotal); 
            
            // 3. Success actions
            clearCart();
            alert("Checkout successful! Order ID: " + orderId);
            navigate('/orders');
        } catch (err: any) {
            console.error("Checkout error:", err);
            alert("Checkout failed: " + err.message);
        }
    };

    // UI Calculation Logic
    const subtotal = getTotal();
    const shipping = subtotal > 50 ? 0 : 5.99;
    const finalTotal = subtotal + shipping;

    if (cart.length === 0) {
        return (
            <div className="cart-page empty-cart">
                <div className="empty-cart-content">
                    <span className="empty-icon">🛒</span>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any fresh groceries yet.</p>
                    <button className="btn-continue-shopping" onClick={() => navigate('/catalog')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1 className="cart-title">My Cart</h1>
                
                <div className="cart-layout">
                    <div className="cart-items-section">
                        <div className="cart-header">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        {cart.map((item) => (
                            <div key={item.product_id} className="cart-item">
                                <div className="item-info">
                                    <div className="item-image">
                                        <img 
                                            src={item.image_url || 'https://via.placeholder.com/100?text=📦'} 
                                            alt={item.name} 
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="item-quantity">
                                    <button 
                                        className="qty-btn"
                                        onClick={() => decreaseQuantity(item.product_id)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    
                                    <span className="qty-number">{item.quantity}</span>
                                    
                                    <button 
                                        className="qty-btn"
                                        onClick={() => addToCart({
                                            product_id: item.product_id,
                                            name: item.name,
                                            price: item.price,
                                            quantity: 1,
                                            image_url: item.image_url
                                        })}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="item-total-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.product_id)}
                                        title="Remove item"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-section">
                        <div className="summary-card">
                            <h2>Order Summary</h2>
                            
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? <span className="free-shipping">Free</span> : `$${shipping.toFixed(2)}`}</span>
                            </div>

                            {shipping > 0 && (
                                <div className="shipping-hint">
                                    Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                                </div>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>

                            {error && <div className="cart-error-msg">⚠️ {error}</div>}

                            <button 
                                className="btn-checkout"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Placing Order...' : 'Checkout'}
                            </button>

                            <button className="btn-clear-cart" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}