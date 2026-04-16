import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useOrderItems } from '../hooks/useOrderItems'
import '../css/OrdersPage.css'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusClass(status: string) {
  if (status === 'pending') return 'order-status pending'
  if (status === 'confirmed') return 'order-status confirmed'
  return 'order-status fulfilled'
}

function OrderItems({ orderId }: { orderId: string }) {
  const { items, loading, error } = useOrderItems(orderId)
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="order-items-section">
        <div className="order-items-heading">
          <strong>Items in this order</strong>
        </div>
        <p className="orders-muted">Loading order items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-items-section">
        <div className="order-items-heading">
          <strong>Items in this order</strong>
        </div>
        <p className="orders-error">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="order-items-section">
        <div className="order-items-heading">
          <strong>Items in this order</strong>
        </div>
        <p className="orders-muted">No items found for this order.</p>
      </div>
    )
  }

  return (
    <div className="order-items-section">
      <div className="order-items-heading">
        <strong>Items in this order</strong>
        <span className="order-items-count">
          {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="order-items-list">
        {items.map((item) => (
          <div className="order-item-row" key={item.id}>
            <div className="order-item-main">
              <strong className="order-item-name">{item.product_name || 'Unnamed product'}</strong>
              <span className="order-item-meta">{formatCurrency(item.price_snapshot)} each</span>
            </div>

            <div className="order-item-side">
              <span className="order-item-qty">Qty {item.quantity}</span>
              <strong className="order-item-subtotal">
                {formatCurrency(item.price_snapshot * item.quantity)}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { orders, loading, error } = useOrders()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filteredOrders = useMemo(() => {
    const fromTimestamp = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : -Infinity
    const toTimestamp = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity

    return orders.filter((order) => {
      const createdTimestamp = new Date(order.created_at).getTime()
      return createdTimestamp >= fromTimestamp && createdTimestamp <= toTimestamp
    })
  }, [orders, fromDate, toDate])

  const hasActiveDateFilter = fromDate !== '' || toDate !== ''

  if (loading) {
    return (
      <section className="orders-page">
        <div className="orders-container">
          <div className="orders-state">Loading your orders...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="orders-page">
        <div className="orders-container">
          <div className="orders-state error">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div className="orders-header-top">
            <div>
              <h1>Track your purchases</h1>
              <p className="orders-subtitle">
                Review each order, its status, and the items included.
              </p>
            </div>

            {orders.length > 0 && (
              <div className="orders-count-pill">
                {hasActiveDateFilter
                  ? `${filteredOrders.length} of ${orders.length} orders`
                  : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
              </div>
            )}
          </div>

          {orders.length > 0 && (
            <div className="orders-filter-panel">
              <div className="orders-filter-field">
                <label htmlFor="order-date-from" className="orders-filter-label">From</label>
                <input
                  id="order-date-from"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>

              <div className="orders-filter-field">
                <label htmlFor="order-date-to" className="orders-filter-label">To</label>
                <input
                  id="order-date-to"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>

              {hasActiveDateFilter && (
                <button
                  type="button"
                  className="orders-reset-btn"
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty-card">
            <p className="orders-empty-kicker">No orders yet</p>
            <h2>Your purchase history will show up here.</h2>
            <p>Place your first order and MiniMart will keep the status and item details organized here.</p>
            <Link to="/catalog" className="orders-empty-link">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="orders-empty-card">
                <p className="orders-empty-kicker">No orders found</p>
                <h2>Try a different date range.</h2>
                <p>Adjust the From/To filters above to find orders by purchase date.</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card-header">
                      <div className="order-card-main">
                        <h2>Order #{order.id.slice(0, 8)}</h2>
                        <p className="order-card-date">
                          Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
                        </p>
                        <span className={getStatusClass(order.status)}>{formatStatusLabel(order.status)}</span>
                      </div>

                      <div className="order-card-meta">
                        <div className="order-total-block">
                          <span className="order-total-label">Order total</span>
                          <strong>{formatCurrency(Number(order.total) || 0)}</strong>
                        </div>
                      </div>
                    </div>

                    <OrderItems orderId={order.id} />
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
