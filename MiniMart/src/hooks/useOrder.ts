import { useState } from 'react'
import type { CartItem } from '../types/cart'
import { placeOrder } from '../Services/OrderService'

export function useOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitOrder(cart: CartItem[]): Promise<string> {
    setLoading(true)
    setError(null)
    try {
      const orderId = await placeOrder(cart)
      return orderId
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { submitOrder, loading, error }
}