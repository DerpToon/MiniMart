import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'
import heroBackground from '../assets/catalogpage.jpg'
import '../css/CatalogPage.css'

export default function CatalogPage() {
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()
  const { addToCart } = useCart()
  const location = useLocation()

  const [sortBy, setSortBy] = useState<'featured' | 'low' | 'high' | 'name'>('featured')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(
    () => new URLSearchParams(location.search).get('category') || 'All'
  )
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  function handleAddToCart(product: {
    id: string | number
    name: string
    price: number
    image_url?: string | null
    stock_quantity: number
  }) {
    if (product.stock_quantity <= 0) return

    addToCart({
      product_id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || null
    })
  }

  const categoryOptions = useMemo(() => {
    const options = categories.map((category) => category.name)
    return ['All', ...Array.from(new Set(options))]
  }, [categories])

  function handleCategoryChange(category: string) {
    setCategoryFilter(category)
    setCurrentPage(1)
  }

  function handleSortChange(value: typeof sortBy) {
    setSortBy(value)
    setCurrentPage(1)
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const filteredAndSortedProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    let items = [...products]

    if (query) {
      items = items.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query)
        const descriptionMatch = product.description?.toLowerCase().includes(query) ?? false
        return nameMatch || descriptionMatch
      })
    }

    if (categoryFilter !== 'All') {
      items = items.filter((product) => product.category?.name === categoryFilter)
    }

    if (sortBy === 'low') return items.sort((a, b) => a.price - b.price)
    if (sortBy === 'high') return items.sort((a, b) => b.price - a.price)
    if (sortBy === 'name') return items.sort((a, b) => a.name.localeCompare(b.name))

    return items
  }, [products, searchTerm, sortBy, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / productsPerPage))
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, sortBy])

  if (loading) {
    return (
      <section className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-state">Loading fresh products...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-state error">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="catalog-page">
      <div className="catalog-container">
        <header
          className="catalog-hero"
          style={{
            backgroundImage: `url(${heroBackground})`
          }}
        >
          <div className="catalog-hero-copy">
            <p className="catalog-kicker">Our products</p>
            <h1>Fresh groceries for your everyday shopping</h1>
            <p className="catalog-description">
              Browse fruits, vegetables, dairy, bakery items, and pantry essentials all in one
              place.
            </p>
          </div>
        </header>

        <section className="catalog-filters">
          <div className="catalog-search-wrapper">
            <label htmlFor="catalog-search" className="catalog-filter-label">
              Search products
            </label>
            <input
              id="catalog-search"
              type="text"
              className="catalog-search-input"
              placeholder="Search by product name or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="catalog-sort-wrapper">
            <label htmlFor="catalog-sort" className="catalog-filter-label">
              Sort by
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              className="catalog-sort-select"
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="catalog-sort-wrapper">
            <label htmlFor="catalog-category" className="catalog-filter-label">
              Category
            </label>
            <select
              id="catalog-category"
              value={categoryFilter}
              className="catalog-sort-select"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="catalog-summary-chip">{filteredAndSortedProducts.length} items found</div>
        </section>

        <section className="catalog-category-chips">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              className={`catalog-category-chip ${categoryFilter === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </section>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="catalog-state">
            {searchTerm.trim()
              ? 'No products match your search.'
              : 'No products found in the catalog.'}
          </div>
        ) : (
          <>
            <div className="catalog-grid">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            <div className="catalog-pagination">
              <button
                type="button"
                className="catalog-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </button>

              <div className="catalog-page-indicators">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    className={`catalog-page-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="catalog-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
