import { useEffect, useMemo, useState } from 'react'
import { getAllOrders, updateOrderStatus, deleteOrder } from '../Services/OrderService'
import { useOrderItems } from '../hooks/useOrderItems'
import type { Order } from '../types/db'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import '../css/AdminOrdersPage.css'

function OrderItemsRow({ orderId }: { orderId: string }) {
  const { items, loading } = useOrderItems(orderId)

  if (loading) return <tr><td colSpan={6} style={{ padding: '12px', textAlign: 'center', color: '#666' }}>Loading items...</td></tr>
  if (items.length === 0) return <tr><td colSpan={6} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>No items found</td></tr>

  return (
    <>
      {items.map((item, idx) => (
        <tr key={item.id} style={{ backgroundColor: '#f9faf9', borderTop: idx === 0 ? '1px solid #e5e5e5' : 'none' }}>
          <td style={{ paddingLeft: '60px', color: '#666', fontSize: '0.9em' }}></td>
          <td style={{ color: '#666', fontSize: '0.9em' }}>{item.product_name}</td>
          <td style={{ color: '#666', fontSize: '0.9em' }}>Qty: {item.quantity}</td>
          <td style={{ color: '#666', fontSize: '0.9em' }}>${(item.price_snapshot * item.quantity).toFixed(2)}</td>
          <td></td>
          <td></td>
        </tr>
      ))}
    </>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders()
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => order.status === 'pending').length

    const chartData = [...Array(7)].map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - index)
      const dateKey = date.toISOString().split('T')[0]
      const dayOrders = orders.filter((order) => order.created_at.startsWith(dateKey))

      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
        orderCount: dayOrders.length
      }
    }).reverse()

    return { totalRevenue, totalOrders, pendingOrders, chartData }
  }, [orders])

  async function handleDeleteOrder(orderId: string) {
    if (!window.confirm('Are you sure you want to delete this fulfilled order? This action cannot be undone.')) {
      return
    }

    try {
      await deleteOrder(orderId)
      setOrders(orders.filter(o => o.id !== orderId))
      alert('Order deleted successfully')
    } catch (err: any) {
      alert(`Failed to delete order: ${err.message}`)
    }
  }

  if (loading) {
    return <section className="admin-orders-page"><div className="admin-orders-shell"><div className="admin-orders-state">Loading order analytics...</div></div></section>
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-shell">
        <header className="admin-orders-header">
          <div>
            <p className="admin-orders-kicker">Admin / Orders</p>
            <h1>Business overview</h1>
            <p>Revenue snapshot, order activity, and live order management.</p>
          </div>
          <div className="admin-orders-total-card">
            <span>Total revenue</span>
            <strong>${stats.totalRevenue.toFixed(2)}</strong>
          </div>
        </header>

        <section className="admin-orders-stat-grid">
          <article className="orders-stat-card">
            <span>Total orders</span>
            <strong>{stats.totalOrders}</strong>
          </article>
          <article className="orders-stat-card">
            <span>Pending orders</span>
            <strong>{stats.pendingOrders}</strong>
          </article>
          <article className="orders-stat-card highlight">
            <span>7-day revenue view</span>
            <strong>${stats.chartData.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}</strong>
          </article>
        </section>

        <section className="admin-orders-chart-grid">
          <div className="admin-orders-chart-card">
            <h2>Daily revenue</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce8df" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#1b6b59" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-orders-chart-card">
            <h2>Order volume</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce8df" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orderCount"
                    name="Orders"
                    stroke="#94c84f"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#94c84f' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="admin-orders-table-card">
          <div className="admin-orders-table-head">
            <h2>Manage orders</h2>
          </div>

          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <>
                    <tr key={order.id}>
                      <td style={{ width: '40px', textAlign: 'center' }}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '4px 8px'
                          }}
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          {expandedOrder === order.id ? '▼' : '▶'}
                        </button>
                      </td>
                      <td>
                        <div className="order-ref-cell">
                          <strong>#{order.id.slice(0, 8)}</strong>
                          <span>User: {order.user_id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="amount-cell">${(Number(order.total) || 0).toFixed(2)}</td>
                      <td>
                        <select
                          className={`order-status-select ${order.status}`}
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as Order['status']).then(() =>
                              window.location.reload()
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="fulfilled">Fulfilled</option>
                        </select>
                      </td>
                      <td>
                        {order.status === 'fulfilled' && (
                          <button
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: '500'
                            }}
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedOrder === order.id && <OrderItemsRow orderId={order.id} />}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}
