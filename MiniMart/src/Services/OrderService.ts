import { supabase } from '../lib/supabase'
import type { CartItem } from '../types/cart'
import type { Order, OrderItem } from '../types/db'

export async function placeOrder(cart: CartItem[]): Promise<string> {
  const formattedItems = cart.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity
  }))

  const { data, error } = await supabase.rpc('place_order', {
    p_items: formattedItems
  })

  if (error) throw error

  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object' && 'order_id' in data) {
    return String((data as { order_id: string }).order_id)
  }

  throw new Error('Order ID not returned')
}

export async function getMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase.rpc('get_my_orders')

  if (error) throw error
  return data || []
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase.rpc('get_order_items', {
    p_order_id: orderId
  })

  if (error) throw error
  return data || []
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}