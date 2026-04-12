import { useEffect, useState } from 'react'
import { getErrorMessage } from '../lib/error'
import type { Order } from '../types/db'
import { getMyOrders } from '../Services/OrderService'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMyOrders()
        setOrders(data)
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to load orders.'))
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return { orders, loading, error }
}
