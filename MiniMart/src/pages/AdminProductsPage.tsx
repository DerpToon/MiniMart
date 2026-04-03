import { useMemo, useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import {
  createProduct,
  deleteProduct,
  updateProduct
} from '../Services/ProductService'
import type { Product, ProductFormData } from '../types/db'
import '../css/AdminProductsPage.css'

const initialForm: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  image_url: ''
}

export default function AdminProductsPage() {
  const { products, loading, error } = useProducts()
  const [form, setForm] = useState<ProductFormData>(initialForm)
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const pageTitle = useMemo(
    () => (editingProduct ? 'Edit Product' : 'Add Product'),
    [editingProduct]
  )

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stock_quantity'
          ? Number(value)
          : value
    }))
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || ''
    })
    setSelectedFile(undefined)
    setMessage('')
    setActionError('')
  }

  function resetForm() {
    setEditingProduct(null)
    setForm(initialForm)
    setSelectedFile(undefined)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setActionError('')

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form, selectedFile)
        setMessage('Product updated successfully.')
      } else {
        await createProduct(form, selectedFile)
        setMessage('Product created successfully.')
      }

      resetForm()
      window.location.reload()
    } catch (err: any) {
      setActionError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(productId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this product?')

    if (!confirmed) return

    setMessage('')
    setActionError('')

    try {
      await deleteProduct(productId)
      setMessage('Product deleted successfully.')
      window.location.reload()
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete product.')
    }
  }

  return (
    <section className="admin-products-page">
      <div className="admin-products-header">
        <h1>Admin Products</h1>
        <p>Manage your catalog here.</p>
      </div>

      <div className="admin-products-layout">
        <form className="admin-products-form" onSubmit={handleSubmit}>
          <h2>{pageTitle}</h2>

          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label>
            Price
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Stock Quantity
            <input
              type="number"
              name="stock_quantity"
              value={form.stock_quantity}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Image URL
            <input
              type="text"
              name="image_url"
              value={form.image_url || ''}
              onChange={handleChange}
              placeholder="Optional public image URL"
            />
          </label>

          <label>
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0])}
            />
          </label>

          <div className="admin-products-form__actions">
            <button type="submit" disabled={submitting}>
              {submitting
                ? editingProduct
                  ? 'Updating...'
                  : 'Creating...'
                : editingProduct
                ? 'Update Product'
                : 'Create Product'}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {message && <p className="admin-products-success">{message}</p>}
          {actionError && <p className="admin-products-error">{actionError}</p>}
        </form>

        <div className="admin-products-list">
          <h2>All Products</h2>

          {loading && <p>Loading products...</p>}
          {error && <p className="admin-products-error">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p>No products found.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          className="admin-products-thumb"
                          src={
                            product.image_url ||
                            'https://via.placeholder.com/70x70?text=No+Image'
                          }
                          alt={product.name}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock_quantity}</td>
                      <td>
                        <div className="admin-products-actions">
                          <button onClick={() => handleEdit(product)}>Edit</button>
                          <button
                            className="danger"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}