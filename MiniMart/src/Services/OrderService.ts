import { supabase } from '../lib/supabase'
import type { CartItem } from '../types/cart'
import type { Order, OrderItem } from '../types/db'

type OrderItemRow = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_snapshot: number
}

type ProductNameRow = {
  id: string
  name: string
}

export async function placeOrder(cart: CartItem[], total: number): Promise<string> {
  const formattedItems = cart.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity
  }))

  console.log('💳 Placing order with items:', formattedItems, 'Total:', total)

  const { data, error } = await supabase.rpc('place_order', {
    p_items: formattedItems,
    p_total: total
  })

  console.log('📝 RPC response:', { data, error })

  if (error) throw error

  // Handle multiple possible response formats
  let orderId: string | null = null

  if (typeof data === 'string') {
    orderId = data
    console.log('✅ Order ID (string):', orderId)
  } else if (data && typeof data === 'object') {
    // Try different property names
    orderId = 
      (data as any).order_id ||
      (data as any).id ||
      (data as any).return_value ||
      null

    if (orderId) {
      orderId = String(orderId)
      console.log('✅ Order ID (object property):', orderId)
    }
  }

  if (!orderId) {
    console.error('❌ Unexpected RPC response format:', data)
    throw new Error('Order ID not returned from place_order')
  }

  // WORKAROUND: The RPC isn't inserting items, so we do it here
  console.log('🔧 Inserting order items manually (RPC bug workaround)')
  
  const itemsToInsert = formattedItems.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    price_snapshot: cart.find(c => c.product_id === item.product_id)?.price || 0
  }))

  const { error: insertError } = await supabase
    .from('order_items')
    .insert(itemsToInsert)

  if (insertError) {
    console.error('❌ Failed to insert order items:', insertError)
    throw new Error(`Order created but items failed to insert: ${insertError.message}`)
  }

  console.log('✅ Order items inserted successfully')

  // Verify order items were created
  const { data: itemRows } = await supabase
    .from('order_items')
    .select('id, order_id')
    .eq('order_id', orderId)
    .limit(1)

  console.log('🔍 Verification - Order items found:', itemRows?.length || 0)

  if (!itemRows || itemRows.length === 0) {
    console.warn('⚠️ Order created but items still not found! Order ID:', orderId)
  }

  return orderId
}

export async function getMyOrders(): Promise<Order[]> {
  console.log('📥 getMyOrders: Calling RPC to fetch user orders')
  
  const { data, error } = await supabase.rpc('get_my_orders')

  console.log('📥 getMyOrders result:', {
    count: (data || []).length,
    orderIds: (data || []).map((o: any) => o.id),
    error: error?.message
  })

  if (error) throw error
  return data || []
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  console.log('🔍 getOrderItems called with orderId:', orderId, 'Type:', typeof orderId)

  // First, check if order exists
  const { data: orderCheck } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('id', orderId)
    .single()

  console.log('📋 Order check:', { orderExists: !!orderCheck, orderId, user_id: orderCheck?.user_id })

  // Try the query with a direct approach
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, quantity, price_snapshot')
    .eq('order_id', orderId)
    .order('id', { ascending: true })

  console.log('📦 Query result:', { itemRows: itemRows?.length, error: itemsError?.message, orderId })

  if (itemsError) {
    console.error('❌ Query error details:', itemsError)
    throw itemsError
  }

  const safeItems = (itemRows || []) as OrderItemRow[]
  console.log('🔍 Found items:', safeItems.length)

  if (safeItems.length === 0) {
    // Debug: show what order_items exist in the database
    const { data: allItems } = await supabase
      .from('order_items')
      .select('order_id')
      .limit(10)
    
    const uniqueOrderIds = [...new Set((allItems || []).map(i => i.order_id))]
    console.warn('⚠️ No items found for order. Sample order_ids in table:', uniqueOrderIds)
    console.warn('⚠️ Looking for:', orderId)
    console.warn('⚠️ Match found:', uniqueOrderIds.includes(orderId))
    
    return []
  }

  const productIds = [...new Set(safeItems.map((item) => item.product_id).filter(Boolean))]

  let productNameMap = new Map<string, string>()

  if (productIds.length > 0) {
    const { data: productRows, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)

    if (productsError) throw productsError

    productNameMap = new Map(
      ((productRows || []) as ProductNameRow[]).map((product) => [product.id, product.name])
    )
  }

  return safeItems.map((item) => ({
    ...item,
    product_name: productNameMap.get(item.product_id) || `Product #${item.product_id.slice(0, 8)}`
  }))
}

// Debug helper - logs database diagnostics
export async function debugOrderDatabase() {
  console.log('🔧 === DATABASE DIAGNOSTIC ===')
  
  // Check total orders
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  console.log('📊 Total orders:', orderCount)

  // Check total order items
  const { count: itemCount } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
  console.log('📊 Total order items:', itemCount)

  // Sample orders
  const { data: sampleOrders } = await supabase
    .from('orders')
    .select('id, user_id, status, total')
    .limit(3)
  console.log('📋 Sample orders:', sampleOrders)

  // Sample order items
  const { data: sampleItems } = await supabase
    .from('order_items')
    .select('order_id, product_id, quantity')
    .limit(5)
  console.log('📦 Sample order items:', sampleItems)

  // Check for NULL order_ids
  const { data: nullItems } = await supabase
    .from('order_items')
    .select('id, order_id')
    .is('order_id', null)
  console.log('🚨 Items with NULL order_id:', nullItems?.length || 0, nullItems)

  console.log('🔧 === END DIAGNOSTIC ===')
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

export async function deleteOrder(orderId: string): Promise<void> {
  // Delete order items first (due to foreign key constraint)
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId)

  if (itemsError) throw itemsError

  // Then delete the order
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) throw error
}