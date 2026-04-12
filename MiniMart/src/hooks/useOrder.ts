import { useState } from 'react'
import type { CartItem } from '../types/cart'
import { getErrorMessage } from '../lib/error'
import { placeOrder } from '../Services/OrderService'

export function useOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // FIX: Added 'total' parameter here so the Cart Page can pass the price
  async function submitOrder(cart: CartItem[], total: number): Promise<string> {
    setLoading(true)
    setError(null)
    try {
      // FIX: Passing both cart and total to the service
      const orderId = await placeOrder(cart, total)
      return orderId
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to place order.'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { submitOrder, loading, error }
}
