import type { Order } from '../../types/db'

type OrderCardProps = {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow mb-4">
      <h2 className="font-bold">Order #{order.id}</h2>
      <p className="text-gray-500">{order.created_at}</p>
      <p>Total: ${order.total}</p>
    </div>
  )
}
