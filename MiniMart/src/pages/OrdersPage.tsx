import { useOrders } from '../hooks/useOrders'
import { useOrderItems } from '../hooks/useOrderItems'
import '../css/OrdersPage.css'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function getStatusClass(status: string) {
  if (status === 'pending') return 'order-status pending'
  if (status === 'confirmed') return 'order-status confirmed'
  return 'order-status fulfilled'
}

function OrderItems({ orderId }: { orderId: string }) {
  const { items, loading, error } = useOrderItems(orderId)

  if (loading) return <p className="orders-muted">Loading order items...</p>
  if (error) return <p className="orders-error">{error}</p>
  if (items.length === 0) return <p className="orders-muted">No items found for this order.</p>

  return (
    <div className="order-items-list">
      {items.map((item) => (
        <div className="order-item-row" key={item.id}>
          <div>
            <strong className="order-item-name">{item.product_name || 'Unnamed product'}</strong>
            <span className="order-item-qty">Quantity: {item.quantity}</span>
          </div>
          <strong className="order-item-subtotal">
            ${(item.price_snapshot * item.quantity).toFixed(2)}
          </strong>
        </div>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { orders, loading, error } = useOrders()

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
          <p className="orders-kicker">Orders</p>
          <h1>Track your purchases</h1>
          <p className="orders-subtitle">Review each order, its status, and the items included.</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty-card">You have not placed any orders yet.</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <h2>Order #{order.id.slice(0, 8)}</h2>
                    <p>{formatDate(order.created_at)}</p>
                  </div>

                  <div className="order-card-meta">
                    <span className={getStatusClass(order.status)}>{order.status}</span>
                    <strong>${(Number(order.total) || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <OrderItems orderId={order.id} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}