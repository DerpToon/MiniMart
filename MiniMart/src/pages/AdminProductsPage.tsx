import { useEffect, useMemo, useRef, useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { getErrorMessage } from '../lib/error'
import { createProduct, deleteProduct, updateProduct } from '../Services/ProductService'
import type { Product, ProductFormData } from '../types/db'
import '../css/AdminProductsPage.css'

const fallbackCategoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Pantry', 'Snacks']
const productImagePlaceholder = 'https://via.placeholder.com/80x80?text=MiniMart'

function getProductImageUrl(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim() ?? ''

  if (!trimmed) return productImagePlaceholder

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  return productImagePlaceholder
}

const initialForm: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  image_url: '',
  category_id: ''
}

export default function AdminProductsPage() {
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()
  const [form, setForm] = useState<ProductFormData>(initialForm)
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(500)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, true>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableCategories = useMemo(() => {
    const categoryNames = categories.map((category) => category.name)
    return ['All', ...Array.from(new Set([...fallbackCategoryOptions, ...categoryNames]))]
  }, [categories])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice
      const matchesCategory =
        selectedCategory === 'All' ||
        (product.category?.name === selectedCategory)

      return matchesName && matchesPrice && matchesCategory
    })
  }, [products, searchTerm, minPrice, maxPrice, selectedCategory])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, minPrice, maxPrice, selectedCategory, products.length])

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage
    return filteredProducts.slice(start, start + productsPerPage)
  }, [filteredProducts, currentPage])

  async function handleSmartCreate(data: ProductFormData, file?: File) {
    const existing = products.find((product) => product.name.toLowerCase() === data.name.toLowerCase())

    if (existing) {
      await updateProduct(existing.id, {
        name: existing.name,
        description: existing.description || '',
        price: existing.price,
        stock_quantity: existing.stock_quantity + data.stock_quantity,
        image_url: existing.image_url || '',
        category_id: data.category_id ?? existing.category_id ?? null
      }, file)
      return
    }

    await createProduct(data, file)
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (!Array.isArray(json)) throw new Error('JSON must be an array')

        setSubmitting(true)
        for (const item of json) {
          await handleSmartCreate({
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            stock_quantity: Number(item.stock_quantity || 0),
            image_url: item.image_url || '',
            category_id: item.category_id || item.category || null
          })
        }
        alert('Bulk upload successful!')
        window.location.reload()
      } catch {
        alert('Error: Invalid JSON file format.')
      } finally {
        setSubmitting(false)
      }
    }
    reader.readAsText(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form, selectedFile)
      } else {
        await handleSmartCreate(form, selectedFile)
      }
      resetForm()
      window.location.reload()
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to save product.'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || '',
      category_id: product.category?.id ?? ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingProduct(null)
    setForm(initialForm)
    setSelectedFile(undefined)
  }

  function markImageAsBroken(productId: string) {
    setBrokenImageIds((prev) => {
      if (prev[productId]) return prev
      return { ...prev, [productId]: true }
    })
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      setSubmitting(true)
      await deleteProduct(product.id)
      window.location.reload()
    } catch (error: unknown) {
      alert(`Delete failed: ${getErrorMessage(error, 'Unable to delete product.')}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <section className="admin-page"><div className="admin-shell"><div className="admin-state">Loading inventory...</div></div></section>
  }

  if (error) {
    return <section className="admin-page"><div className="admin-shell"><div className="admin-state error">{error}</div></div></section>
  }

  return (
    <section className="admin-page">
      <div className="admin-shell">
        <header className="admin-header-block">
          <div>
            <p className="admin-kicker">Admin / Products</p>
            <h1>Manage inventory</h1>
            <p>Cleaner form layout, clearer filters, and a stronger table design.</p>
          </div>

          <div className="admin-header-actions">
            <input
              hidden
              ref={fileInputRef}
              type="file"
              onChange={handleBulkUpload}
              accept=".json"
            />
            <button className="admin-secondary-btn" type="button" onClick={() => fileInputRef.current?.click()}>
              {submitting ? 'Uploading...' : 'Bulk import JSON'}
            </button>
            <div className="admin-stat-pill">{products.length} total products</div>
          </div>
        </header>

        <div className="admin-grid-layout">
          <aside className="admin-form-card">
            <div className="admin-card-head">
              <h2>{editingProduct ? 'Edit product' : 'Add product'}</h2>
              <p>{editingProduct ? 'Update existing product info.' : 'Create a new catalog item.'}</p>
            </div>

            <form className="admin-product-form" onSubmit={handleSubmit}>
              <label>
                <span>Product name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Example: Fuji Apples"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional short product description"
                  rows={4}
                />
              </label>

              <div className="admin-form-row">
                <label>
                  <span>Price ($)</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  <span>Stock</span>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                    required
                  />
                </label>
              </div>

              <label>
                <span>Category</span>
                <select
                  value={form.category_id || ''}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {(categories.length > 0 ? categories : fallbackCategoryOptions.map((name) => ({ id: name, name, slug: name.toLowerCase() }))).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Product image</span>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0])} />
              </label>

              <div className="admin-form-actions">
                <button className="admin-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : editingProduct ? 'Save changes' : 'Add to catalog'}
                </button>
                {editingProduct && (
                  <button className="admin-ghost-btn" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </aside>

          <main className="admin-table-card">
            <div className="admin-table-toolbar">
              <label className="admin-search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search by product name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>

              <div className="admin-range-group">
                <label>
                  <span>Min: ${minPrice}</span>
                  <input type="range" min="0" max="100" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} />
                </label>
                <label>
                  <span>Max: ${maxPrice}</span>
                  <input type="range" min="0" max="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
                </label>
                <label>
                  <span>Category</span>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length > 0 ? currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={brokenImageIds[product.id] ? productImagePlaceholder : getProductImageUrl(product.image_url)}
                            alt={product.name}
                            loading="lazy"
                            onError={() => markImageAsBroken(product.id)}
                          />
                          <div>
                            <strong>{product.name}</strong>
                            <span>ID: {product.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="admin-desc-cell">{product.description || '—'}</td>
                      <td>{product.category?.name || 'Uncategorized'}</td>
                      <td className="admin-price-cell">${product.price.toFixed(2)}</td>
                      <td>
                        <span className={`admin-stock-chip ${product.stock_quantity <= 8 ? 'low' : 'ok'}`}>
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" className="edit" onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete"
                            onClick={() => handleDelete(product)}
                            disabled={submitting}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="admin-empty-row">
                        No products match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalProductPages > 1 && (
              <div className="admin-pagination">
                <span>
                  Showing {currentProducts.length ? (currentPage - 1) * productsPerPage + 1 : 0} - {(currentPage - 1) * productsPerPage + currentProducts.length} of {filteredProducts.length}
                </span>
                <div className="pagination-buttons">
                  <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                    Previous
                  </button>
                  {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === currentPage ? 'active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button type="button" disabled={currentPage === totalProductPages} onClick={() => setCurrentPage((page) => page + 1)}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}
