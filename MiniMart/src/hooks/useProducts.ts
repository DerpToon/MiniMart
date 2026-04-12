import { useEffect, useState } from 'react'
import { getErrorMessage } from '../lib/error'
import { getProducts } from '../Services/ProductService'
import type { Product } from '../types/db'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)

      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to load products.'))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}
