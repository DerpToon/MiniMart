import { useEffect, useState } from 'react'
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
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [cardholderName, setCardholderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [successFadeOut, setSuccessFadeOut] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping
  const remainingForFreeShipping = Math.max(0, 50 - subtotal)
  const itemCountLabel = `${cart.length} ${cart.length === 1 ? 'item' : 'items'}`

  function openCheckout() {
    if (cart.length === 0) return
    setCheckoutFormError(null)
    setCheckoutOpen(true)
  }

  function closeCheckout() {
    if (loading) return
    setCheckoutFormError(null)
    setCheckoutOpen(false)
  }

  function resetPaymentForm() {
    setPaymentMethod('cash')
    setCardholderName('')
    setCardNumber('')
    setExpiryDate('')
    setSecurityCode('')
    setCheckoutFormError(null)
  }

  async function handleCheckout() {
    if (cart.length === 0) return

    if (paymentMethod === 'card') {
      const hasMissingCardDetails = !cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !securityCode.trim()
      if (hasMissingCardDetails) {
        setCheckoutFormError('Enter the demo payment details before placing the order.')
        return
      }
    }

    try {
      const orderId = await submitOrder(cart, total)
      closeCheckout()
      resetPaymentForm()
      clearCart()
      setSuccessFadeOut(false)
      setSuccessMessage(`Order placed successfully! Order ID: ${orderId}`)
    } catch (error: unknown) {
      console.error(error)
      setSuccessMessage('')
      setSuccessFadeOut(false)
      alert(`Checkout failed: ${getErrorMessage(error, 'Unable to place order.')}`)
    }
  }

  useEffect(() => {
    if (!successMessage) {
      setSuccessFadeOut(false)
      return
    }

    const fadeTimer = window.setTimeout(() => {
      setSuccessFadeOut(true)
    }, 4200)

    const clearTimer = window.setTimeout(() => {
      setSuccessMessage('')
      setSuccessFadeOut(false)
    }, 5000)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(clearTimer)
    }
  }, [successMessage])

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-container">
          <div className="cart-empty-state">
            <div className="cart-empty-inner">
        {successMessage && (
          <div className="cart-success-box cart-success-box-empty" role="status">
            <div className="cart-success-box-top">
              <span className="cart-success-icon" aria-hidden="true">✓</span>
              <div>
                <strong>{successMessage}</strong>
              </div>
            </div>
          </div>
        )}

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

        {successMessage && (
          <div className={`cart-success-box ${successFadeOut ? 'fade-out' : ''}`} role="status">
            <div className="cart-success-box-top">
              <span className="cart-success-icon" aria-hidden="true">✓</span>
              <div>
                <strong>{successMessage}</strong>
              </div>
            </div>
          </div>
        )}

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
              <div className="cart-summary-head">
                <div>
                  <span className="cart-summary-kicker">Checkout</span>
                  <h2>Order summary</h2>
                </div>
                <span className="cart-summary-count">{itemCountLabel}</span>
              </div>

              <div className="cart-total-highlight">
                <span>Total due</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-breakdown">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong>
                </div>
              </div>

              {shipping > 0 ? (
                <p className="shipping-tip">Add ${remainingForFreeShipping.toFixed(2)} more to unlock free shipping.</p>
              ) : (
                <p className="shipping-tip shipping-tip-success">Free shipping unlocked on this order.</p>
              )}

              {error && <div className="cart-error-box">{error}</div>}

              <button className="cart-primary-btn full" type="button" onClick={openCheckout} disabled={loading}>
                {loading ? 'Placing order...' : 'Checkout'}
              </button>

              <p className="cart-summary-note">Your order will appear in My Orders right after checkout.</p>
            </div>
          </aside>
        </div>

        {checkoutOpen && (
          <div className="cart-checkout-overlay" role="presentation" onClick={closeCheckout}>
            <div
              className="cart-checkout-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-checkout-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cart-checkout-header">
                <div>
                  <h2 id="cart-checkout-title">Choose how you want to pay</h2>
                  <p>Pick a payment method before placing this order.</p>
                </div>

                <button className="cart-checkout-close" type="button" onClick={closeCheckout} aria-label="Close checkout">
                  &times;
                </button>
              </div>

              <div className="cart-checkout-methods" role="radiogroup" aria-label="Payment methods">
                <button
                  className={`cart-payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  role="radio"
                  aria-checked={paymentMethod === 'cash'}
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cash')
                    setCheckoutFormError(null)
                  }}
                >
                  <span className="cart-payment-option-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-9Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="8" cy="14" r="1.2" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="cart-payment-option-body">
                    <span className="cart-payment-option-title">Pay with cash</span>
                    <span className="cart-payment-option-meta">Cash on delivery</span>
                  </span>
                  <span className="cart-payment-option-indicator" aria-hidden="true" />
                </button>

                <button
                  className={`cart-payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                  role="radio"
                  aria-checked={paymentMethod === 'card'}
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card')
                    setCheckoutFormError(null)
                  }}
                >
                  <span className="cart-payment-option-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5.5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 14h3M13 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="cart-payment-option-body">
                    <span className="cart-payment-option-title">Pay with Card</span>
                    <span className="cart-payment-option-meta">Card details</span>
                  </span>
                  <span className="cart-payment-option-indicator" aria-hidden="true" />
                </button>
              </div>

              {paymentMethod === 'cash' ? (
                <div className="cart-payment-cash-panel">
                  <div className="cart-payment-cash-copy">
                    <h3>Pay when the order arrives</h3>
                    <p>No online payment is required. We will place the order and payment happens on delivery or pickup.</p>
                  </div>
                </div>
              ) : (
                <div className="cart-payment-form">
                  <div className="cart-payment-form-header">
                    <div>
                      <h3>Card information</h3>
                      <p>Enter the payment details for this order.</p>
                    </div>
                  </div>

                  <div className="cart-payment-field full-width">
                    <label htmlFor="cardholderName">Cardholder name</label>
                    <input
                      id="cardholderName"
                      type="text"
                      placeholder="Name on card"
                      value={cardholderName}
                      onChange={(event) => setCardholderName(event.target.value)}
                    />
                  </div>

                  <div className="cart-payment-field full-width">
                    <label htmlFor="cardNumber">Card number</label>
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                    />
                  </div>

                  <div className="cart-payment-field">
                    <label htmlFor="expiryDate">Expiry</label>
                    <input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(event.target.value)}
                    />
                  </div>

                  <div className="cart-payment-field">
                    <label htmlFor="securityCode">CVC</label>
                    <input
                      id="securityCode"
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      value={securityCode}
                      onChange={(event) => setSecurityCode(event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="cart-checkout-summary-card">
                <div className="cart-checkout-summary-main">
                  <span>Order total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <div className="cart-checkout-summary-list">
                  <div className="cart-checkout-summary-row">
                    <span>Items</span>
                    <strong>{itemCountLabel}</strong>
                  </div>
                  <div className="cart-checkout-summary-row">
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>
                  <div className="cart-checkout-summary-row">
                    <span>Shipping</span>
                    <strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong>
                  </div>
                </div>
              </div>

              {checkoutFormError && <div className="cart-error-box">{checkoutFormError}</div>}
              {error && <div className="cart-error-box">{error}</div>}

              <div className="cart-checkout-actions">
                <button className="cart-secondary-btn" type="button" onClick={closeCheckout} disabled={loading}>
                  Cancel
                </button>
                <button className="cart-primary-btn" type="button" onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
