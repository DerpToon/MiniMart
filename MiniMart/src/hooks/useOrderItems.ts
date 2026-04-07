import { useEffect, useState } from 'react'
import type { OrderItem } from '../types/db'
import { getOrderItems } from '../Services/OrderService'

export function useOrderItems(orderId: string) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setItems([])
      setLoading(false)
      return
    }

    async function fetchItems() {
      setLoading(true)
      setError(null)

      try {
        const data = await getOrderItems(orderId)
        setItems(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load order items.')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [orderId])

  return { items, loading, error }
}