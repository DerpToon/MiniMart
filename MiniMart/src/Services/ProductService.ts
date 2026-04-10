import { supabase } from '../lib/supabase'
import type { Product, ProductFormData, ProductReview } from '../types/db'

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function uploadProductImage(file: File): Promise<string> {
  const filePath = `products/${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function getProductById(productId: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('id', productId)
    .single()

  if (error) throw error
  return data
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createProductReview(
  productId: string,
  review: { rating: number; comment: string },
  userId: string | null,
  userEmail?: string | null
): Promise<ProductReview> {
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      user_email: userEmail ?? null,
      rating: review.rating,
      comment: review.comment
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createProduct(
  newProduct: ProductFormData,
  file?: File
): Promise<Product> {
  let imageUrl: string | null = newProduct.image_url ?? null

  if (file) {
    imageUrl = await uploadProductImage(file)
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      stock_quantity: newProduct.stock_quantity,
      image_url: imageUrl,
      category_id: newProduct.category_id ?? null
    })
    .select('*, category:categories(id, name, slug)')
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(
  productId: string,
  updatedProduct: ProductFormData,
  file?: File
): Promise<Product> {
  let imageUrl: string | null = updatedProduct.image_url ?? null

  if (file) {
    imageUrl = await uploadProductImage(file)
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      stock_quantity: updatedProduct.stock_quantity,
      image_url: imageUrl,
      category_id: updatedProduct.category_id ?? null
    })
    .eq('id', productId)
    .select('*, category:categories(id, name, slug)')
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(productId: string): Promise<void> {
  // Check if product has any orders
  const { data: orderItems, error: checkError } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', productId)
    .limit(1)

  if (checkError) throw checkError

  if (orderItems && orderItems.length > 0) {
    throw new Error(
      'Cannot delete this product because it has existing orders. You can set the stock quantity to 0 to make it unavailable instead.'
    )
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'Cannot delete this product because it has existing orders. You can set the stock quantity to 0 to make it unavailable instead.'
      )
    }
    throw error
  }
}