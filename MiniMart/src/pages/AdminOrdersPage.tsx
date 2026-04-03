import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../Services/OrderService'
import type { Order } from '../types/db'
import '../css/AdminOrdersPage.css'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadOrders() {
      setLoading(true)
      setError('')

      try {
        const data = await getAllOrders()
        setOrders(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  async function handleStatusChange(
    orderId: string,
    status: Order['status']
  ) {
    setError('')
    setMessage('')

    try {
      const updatedOrder = await updateOrderStatus(orderId, status)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      )

      setMessage('Order status updated successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.')
    }
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-header">
        <h1>Admin Orders</h1>
        <p>Review and manage customer orders.</p>
      </div>

      {message && <p className="admin-orders-success">{message}</p>}
      {error && <p className="admin-orders-error">{error}</p>}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="admin-orders-empty">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.slice(0, 8)}</td>
                  <td>{order.user_id.slice(0, 8)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order['status']
                        )
                      }
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="fulfilled">fulfilled</option>
                    </select>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}