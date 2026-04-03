import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useOrder } from '../hooks/useOrder'
import '../css/CartPage.css'

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const { submitOrder, loading, error } = useOrder()
  const navigate = useNavigate()

  async function handleCheckout() {
    if (cart.length === 0) return

    try {
      await submitOrder(cart)
      clearCart()
      navigate('/orders')
    } catch (err) {
      console.error(err)
    }
  }

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <h1 className="cart-title">My Cart</h1>
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <button className="cart-primary-button" onClick={() => navigate('/catalog')}>
            Go to Catalog
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <h1 className="cart-title">My Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.product_id}>
              <img
                className="cart-item-image"
                src={item.image_url || 'https://via.placeholder.com/120x100?text=No+Image'}
                alt={item.name}
              />

              <div className="cart-item-info">
                <h2 className="cart-item-name">{item.name}</h2>
                <p className="cart-item-price">${item.price.toFixed(2)}</p>

                <div className="cart-item-actions">
                  <button
                    className="cart-qty-button"
                    onClick={() => decreaseQuantity(item.product_id)}
                  >
                    -
                  </button>

                  <span className="cart-qty">{item.quantity}</span>

                  <button
                    className="cart-qty-button"
                    onClick={() =>
                      addToCart({
                        product_id: item.product_id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        image_url: item.image_url
                      })
                    }
                  >
                    +
                  </button>

                  <button
                    className="cart-remove-button"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-item-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary-title">Order Summary</h2>

          <div className="cart-summary-row">
            <span>Total</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>

          <button
            className="cart-primary-button"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Checkout'}
          </button>

          <button className="cart-secondary-button" onClick={clearCart}>
            Clear Cart
          </button>

          {error && <p className="cart-error">{error}</p>}
        </aside>
      </div>
    </section>
  )
}