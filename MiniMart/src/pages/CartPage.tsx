import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useOrder } from '../hooks/useOrder'
import { getErrorMessage } from '../lib/error'
import '../css/CartPage.css'

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getTotal } = useCart()
  const { submitOrder, loading, error } = useOrder()
  const navigate = useNavigate()
  const fallbackImage = 'https://via.placeholder.com/180x180?text=MiniMart'

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
            <div className="cart-empty-inner">
              <span className="cart-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 6h1.4c.3 0 .57.2.65.49L7.4 8H18a1 1 0 0 1 .97 1.24l-1.1 4.2a1 1 0 0 1-.97.76H9.1a1 1 0 0 1-.97-.76L6.2 5.8A1 1 0 0 0 5.23 5H5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 19a1 1 0 1 0 0 .01M16 19a1 1 0 1 0 0 .01"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <div className="cart-empty-copy">
                <h1>Your cart is empty</h1>
                <p>Add a few products from the catalog and come back here to check out.</p>
              </div>

              <button
                className="cart-primary-btn cart-empty-cta"
                onClick={() => navigate('/catalog')}
                type="button"
              >
                Start shopping
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <div className="cart-container">
        <div className="cart-heading-row">
          <div className="cart-heading-copy">
            <h1>Review your items</h1>
            <p>{cart.length} {cart.length === 1 ? 'item' : 'items'} ready for checkout.</p>
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
                      src={item.image_url || fallbackImage}
                      alt={item.name}
                      className="cart-item-image"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null
                        currentTarget.src = fallbackImage
                      }}
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
                      -
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
