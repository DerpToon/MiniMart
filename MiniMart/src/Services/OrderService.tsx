// src/services/OrderService.ts
import { supabase } from '../lib/supabase'
import type { CartItem } from '../types/cart'
import type { Order, OrderItem } from '../types/db'

export async function placeOrder(cart: CartItem[]): Promise<string> {
  const formattedItems = cart.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }))

  // RPC returns { order_id: string } object
  const { data, error } = await supabase.rpc('place_order', {
    p_items: formattedItems
  })

  if (error) throw error
  if (!data || !data.order_id) throw new Error('Order ID not returned')

  return data.order_id
}

export async function getMyOrders(): Promise<Order[]> {
  // RPC returns Order[]
  const { data, error } = await supabase.rpc('get_my_orders')
  if (error) throw error
  return data || []
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  // RPC returns OrderItem[]
  const { data, error } = await supabase.rpc('get_order_items', {
    p_order_id: orderId
  })
  if (error) throw error
  return data || []
}