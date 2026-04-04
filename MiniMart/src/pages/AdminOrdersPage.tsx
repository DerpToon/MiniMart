import { useEffect, useState, useMemo } from 'react'
import { getAllOrders, updateOrderStatus } from '../Services/OrderService'
import type { Order } from '../types/db'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts'
import '../css/AdminOrdersPage.css'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    // Chart data for last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      const dayTotalRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const dayOrderCount = dayOrders.length; // Counting the number of orders
      
      return { 
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        revenue: dayTotalRevenue,
        orderCount: dayOrderCount // Added for the second graph
      };
    }).reverse();

    return { totalRevenue, chartData: last7Days };
  }, [orders]);

  if (loading) return <div className="admin-loader">Syncing Business Data...</div>;

  return (
    <div className="admin-orders-container">
      <div className="admin-wrapper">
        <header className="admin-dashboard-header">
          <div>
            <h1>Business Overview</h1>
            <p>Real-time analytics for your MiniMart store.</p>
          </div>
          <div className="revenue-hero-card">
             <span className="label">Total Gross Revenue</span>
             <h2 className="value">${stats.totalRevenue.toFixed(2)}</h2>
          </div>
        </header>

        {/* --- Analytics Section with Two Graphs --- */}
        <section className="analytics-grid">
          
          {/* Revenue Bar Chart */}
          <div className="chart-card">
            <h3>Daily Revenue (USD)</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="revenue" fill="#3bb77e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Progress Line Chart */}
          <div className="chart-card">
            <h3>Order Volume Progress</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="orderCount" 
                    name="Orders Per Day"
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#2563eb' }}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>

        {/* --- Orders Management Table --- */}
        <section className="orders-table-card">
          <div className="card-header">
            <h3>Live Order Management</h3>
          </div>
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id.slice(0, 8)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="total-amount">${(Number(order.total) || 0).toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-pill ${order.status}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any).then(() => window.location.reload())}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="fulfilled">Fulfilled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}