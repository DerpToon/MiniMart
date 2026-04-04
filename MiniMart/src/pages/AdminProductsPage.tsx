import { useMemo, useState, useRef } from 'react'
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
  
  // Advanced Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(500)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      p.price >= minPrice &&
      p.price <= maxPrice
    )
  }, [products, searchTerm, minPrice, maxPrice])

  // --- SMART CREATE (Prevents Duplicates) ---
  async function handleSmartCreate(data: ProductFormData, file?: File) {
    const existing = products.find(p => p.name.toLowerCase() === data.name.toLowerCase());
    if (existing) {
      const newStock = existing.stock_quantity + data.stock_quantity;
      await updateProduct(existing.id, {
        name: existing.name,
        description: existing.description || '',
        price: existing.price,
        stock_quantity: newStock,
        image_url: existing.image_url || ''
      });
    } else {
      await createProduct(data, file);
    }
  }

  // --- BULK UPLOAD LOGIC ---
  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("JSON must be an array");

        setSubmitting(true);
        for (const item of json) {
          await handleSmartCreate({
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            stock_quantity: Number(item.stock_quantity || 0),
            image_url: item.image_url || ''
          });
        }
        alert("Bulk upload successful!");
        window.location.reload();
      } catch (err) {
        alert("Error: Invalid JSON file format.");
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsText(file);
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
    } catch (err: any) {
      alert(err.message)
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
      image_url: product.image_url || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingProduct(null)
    setForm(initialForm)
    setSelectedFile(undefined)
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        <header className="admin-dashboard-header">
          <div className="title-area">
            <h1>Inventory Dashboard</h1>
            <span className="stats-badge">{products.length} Products Total</span>
          </div>
          <div className="header-actions">
            {/* HIDDEN FILE INPUT */}
            <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleBulkUpload} 
               hidden 
               accept=".json" 
            />
            <button className="btn-bulk-premium" onClick={() => fileInputRef.current?.click()}>
              <span className="icon">📂</span> {submitting ? 'Uploading...' : 'Bulk Import JSON'}
            </button>
          </div>
        </header>

        <div className="admin-main-layout">
          
          <aside className="admin-sidebar">
            <div className="admin-card sticky-form">
              <h3 className="card-title">{editingProduct ? '📝 Edit Item' : '✨ New Product'}</h3>
              <form onSubmit={handleSubmit} className="modern-form">
                <div className="field">
                  <label>Product Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Fuji Apples" required />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Price ($)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} step="0.01" required />
                  </div>
                  <div className="field">
                    <label>Stock</label>
                    <input type="number" value={form.stock_quantity} onChange={(e) => setForm({...form, stock_quantity: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="field">
                  <label>Image Upload</label>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0])} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save-main" disabled={submitting}>
                    {submitting ? 'Processing...' : editingProduct ? 'Save Changes' : 'Add to Catalog'}
                  </button>
                  {editingProduct && <button type="button" className="btn-cancel-flat" onClick={resetForm}>Discard</button>}
                </div>
              </form>
            </div>
          </aside>

          <main className="admin-content">
            <div className="admin-card no-padding">
              
              <div className="filter-panel">
                <div className="search-group">
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <div className="price-controls">
                  <div className="range-input">
                    <label>Min Price: ${minPrice}</label>
                    <input type="range" min="0" max="100" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} />
                  </div>
                  <div className="range-input">
                    <label>Max Price: ${maxPrice}</label>
                    <input type="range" min="0" max="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="table-responsive-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Item Details</th>
                      <th>Unit Price</th>
                      <th>Inventory</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="item-meta">
                            <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td className="price-cell">${product.price.toFixed(2)}</td>
                        <td>
                          <span className={`status-chip ${product.stock_quantity < 10 ? 'warning' : 'success'}`}>
                            {product.stock_quantity} units
                          </span>
                        </td>
                        <td className="text-right">
                          <button className="btn-action edit" onClick={() => handleEdit(product)}>Edit</button>
                          <button className="btn-action delete" onClick={() => deleteProduct(product.id).then(() => window.location.reload())}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}