import { useState } from 'react'
import type { CartItem } from '../types/cart'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  function addToCart(item: CartItem) {
    setCart(prev => {
      const existing = prev.find(p => p.product_id === item.product_id)

      if (existing) {
        return prev.map(p =>
          p.product_id === item.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }

      return [...prev, item]
    })
  }

  function removeFromCart(product_id: string) {
    setCart(prev => prev.filter(p => p.product_id !== product_id))
  }

  function clearCart() {
    setCart([])
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  return { cart, addToCart, removeFromCart, clearCart, getTotal }
}