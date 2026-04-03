import { useOrders } from '../hooks/useOrders'
import { useOrderItems } from '../hooks/useOrderItems'
import '../css/OrdersPage.css'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function getStatusClass(status: string) {
  if (status === 'pending') return 'orders-status orders-status--pending'
  if (status === 'confirmed') return 'orders-status orders-status--confirmed'
  return 'orders-status orders-status--fulfilled'
}

function OrderCard({
  orderId,
  createdAt,
  status
}: {
  orderId: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'fulfilled'
}) {
  const { items, loading, error } = useOrderItems(orderId)

  return (
    <article className="orders-card">
      <div className="orders-card__header">
        <div>
          <h2 className="orders-card__title">Order #{orderId.slice(0, 8)}</h2>
          <p className="orders-card__date">{formatDate(createdAt)}</p>
        </div>

        <span className={getStatusClass(status)}>{status}</span>
      </div>

      <div className="orders-card__body">
        {loading && <p className="orders-muted">Loading order items...</p>}
        {error && <p className="orders-error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="orders-muted">No items found for this order.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="orders-items">
            {items.map((item) => (
              <div className="orders-item" key={item.id}>
                <div>
                  <p className="orders-item__name">Product ID: {item.product_id.slice(0, 8)}</p>
                  <p className="orders-item__meta">Quantity: {item.quantity}</p>
                </div>

                <p className="orders-item__price">
                  ${(item.price_snapshot * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function OrdersPage() {
  const { orders, loading, error } = useOrders()

  if (loading) {
    return <p className="orders-state">Loading your orders...</p>
  }

  if (error) {
    return <p className="orders-state orders-error">{error}</p>
  }

  return (
    <section className="orders-page">
      <div className="orders-header">
        <h1 className="orders-page__title">My Orders</h1>
        <p className="orders-page__subtitle">Track the status of your orders here.</p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>You have not placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              orderId={order.id}
              createdAt={order.created_at}
              status={order.status}
            />
          ))}
        </div>
      )}
    </section>
  )
}