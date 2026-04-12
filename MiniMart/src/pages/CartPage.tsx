import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useOrder } from '../hooks/useOrder'
import { getErrorMessage } from '../lib/error'
import '../css/CartPage.css'

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const { submitOrder, loading, error } = useOrder()
  const navigate = useNavigate()

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  async function handleCheckout() {
    if (cart.length === 0) return

    try {
      const orderId = await submitOrder(cart, total)
      clearCart()
      alert(`Checkout successful! Order ID: ${orderId}`)
      navigate('/orders')
    } catch (error: unknown) {
      console.error(error)
      alert(`Checkout failed: ${getErrorMessage(error, 'Unable to place order.')}`)
    }
  }

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-container">
          <div className="cart-empty-state">
            <span className="cart-empty-icon">🛒</span>
            <h1>Your cart is empty</h1>
            <p>Add a few products from the catalog and come back here to check out.</p>
            <button className="cart-primary-btn" onClick={() => navigate('/catalog')} type="button">
              Start shopping
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <div className="cart-container">
        <div className="cart-heading-row">
          <div>
            <p className="cart-kicker">Cart</p>
            <h1>Review your items</h1>
          </div>
          <button className="cart-clear-btn" type="button" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items-panel">
            {cart.map((item) => (
              <article className="cart-item-card" key={item.product_id}>
                <div className="cart-item-left">
                  <div className="cart-item-image-wrap">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/180x180?text=MiniMart'}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>${item.price.toFixed(2)} each</p>
                    <button
                      className="cart-remove-link"
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      Remove item
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <div className="cart-quantity-box">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.product_id)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
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
                  </div>

                  <strong className="cart-line-total">${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary-panel">
            <div className="cart-summary-card">
              <h2>Order summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              {shipping > 0 && (
                <p className="shipping-tip">Add ${(50 - subtotal).toFixed(2)} more to unlock free shipping.</p>
              )}

              {error && <div className="cart-error-box">{error}</div>}

              <button className="cart-primary-btn full" type="button" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Placing order...' : 'Checkout'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
