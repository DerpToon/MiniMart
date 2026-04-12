import { createContext } from 'react'
import type { CartItem } from '../types/cart'

export type CartContextType = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  decreaseQuantity: (productId: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

export const CartContext = createContext<CartContextType | undefined>(undefined)
