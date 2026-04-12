import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { CartItem } from '../types/cart'
import { CartContext } from './cartContext'

const STORAGE_KEY = 'minimart_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)

    if (!savedCart) return []

    try {
      return JSON.parse(savedCart) as CartItem[]
    } catch (error) {
      console.error('Failed to parse saved cart:', error)
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.product_id === item.product_id)

      if (existing) {
        return prev.map((p) =>
          p.product_id === item.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }

      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }, [])

  const decreaseQuantity = useCallback((productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const getItemsCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getTotal,
      getItemsCount
    }),
    [cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getTotal, getItemsCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
