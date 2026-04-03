import { supabase } from '../lib/supabase'
import type { Product, ProductFormData } from '../types/db'

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
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
      image_url: imageUrl
    })
    .select()
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
      image_url: imageUrl
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error
}