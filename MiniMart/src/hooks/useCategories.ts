import { useEffect, useState } from 'react'
import { getCategories } from '../Services/CategoryService'
import { getErrorMessage } from '../lib/error'
import type { Category } from '../types/db'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      setError(null)

      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to load categories.'))
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, loading, error }
}
