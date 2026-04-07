export type Profile = {
  id: string
  full_name: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export type ProfileFormData = {
  full_name: string
  email: string
  new_password: string
  confirm_password: string
}

export type ProfileView = {
  id: string
  full_name: string | null
  email: string
  role: 'customer' | 'admin'
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number
  image_url: string | null
  created_at: string
}

export type ProductFormData = {
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url?: string | null
}

export type Order = {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'fulfilled'
  total: number
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_snapshot: number
  product_name?: string | null
}