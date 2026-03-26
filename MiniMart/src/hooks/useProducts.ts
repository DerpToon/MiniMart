import { useEffect, useState } from 'react'
import { getProducts } from '../Services/ProductService'
import type { Product } from '../types/db'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { products, loading }
}