import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { getProductById, getProductReviews, createProductReview } from '../Services/ProductService'
import type { Product, ProductReview } from '../types/db'
import '../css/ProductDetailsPage.css'

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return

      setLoading(true)
      setError(null)

      try {
        const [productData, reviewData] = await Promise.all([
          getProductById(productId),
          getProductReviews(productId)
        ])

        setProduct(productData)
        setReviews(reviewData)
      } catch (err: any) {
        setError(err.message || 'Unable to load product details.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      navigate('/login')
      return
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5.')
      return
    }

    if (comment.trim().length < 5) {
      setError('Please enter a comment with at least 5 characters.')
      return
    }

    if (!productId) {
      setError('Missing product ID.')
      return
    }

    setSubmitLoading(true)

    try {
      await createProductReview(productId, { rating, comment }, user.id, user.email)
      const latestReviews = await getProductReviews(productId)
      setReviews(latestReviews)
      setComment('')
      setRating(5)
      setSuccess('Your review was submitted successfully.')
    } catch (err: any) {
      setError(err.message || 'Unable to submit review.')
    } finally {
      setSubmitLoading(false)
    }
  }

  function handleAddToCart() {
    if (!product) return
    if (product.stock_quantity <= 0) return

    addToCart({
      product_id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || null
    })
  }

  if (loading) {
    return (
      <section className="product-details-page">
        <div className="product-details-container">
          <p className="product-details-loading">Loading product details...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-error">{error}</div>
          <Link to="/catalog" className="product-details-back-link">
            Back to catalog
          </Link>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-error">Product not found.</div>
          <Link to="/catalog" className="product-details-back-link">
            Back to catalog
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="product-details-page">
      <div className="product-details-container">
        <div className="product-details-top-row">
          <Link to="/catalog" className="product-details-back-link">
            ← Back to catalog
          </Link>
          <div className="product-details-header">
            <h1>{product.name}</h1>
            <p className="product-details-category">
              Category: {product.category?.name || 'Uncategorized'}
            </p>
            <p>{product.description || 'No description available for this product yet.'}</p>
          </div>
        </div>

        <div className="product-details-grid">
          <div className="product-details-image-panel">
            <img
              src={product.image_url || 'https://via.placeholder.com/600x450?text=MiniMart'}
              alt={product.name}
            />
          </div>

          <div className="product-details-info-panel">
            <div className="product-details-summary">
              <div>
                <p className="product-details-label">Price</p>
                <p className="product-details-value">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="product-details-label">Stock</p>
                <p className="product-details-value">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                </p>
              </div>
              <div>
                <p className="product-details-label">Rating</p>
                <p className="product-details-value">
                  {averageRating ? `${averageRating} / 5 (${reviews.length} review${reviews.length === 1 ? '' : 's'})` : 'No ratings yet'}
                </p>
              </div>
            </div>

            <button
              className="product-details-add-button"
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
            >
              {product.stock_quantity > 0 ? 'Add to cart' : 'Out of stock'}
            </button>

            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="review-form-row">
                <div className="review-field-group">
                  <label htmlFor="rating">Rating</label>
                  <div className="rating-buttons" role="group" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={star <= rating ? 'rating-star selected' : 'rating-star'}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="review-form-row">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  placeholder="Write what you liked or what could be better..."
                />
              </div>

              <div className="review-form-actions">
                {error && <div className="review-form-error">{error}</div>}
                {success && <div className="review-form-success">{success}</div>}
                <button className="review-submit-button" type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Submitting...' : user ? 'Post review' : 'Sign in to review'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <section className="product-details-review-section">
          <div className="product-details-review-header">
            <h2>Customer reviews</h2>
            <p>Read what others are saying about this product.</p>
          </div>

          <div className="reviews-scrollbox">
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="reviews-empty">No reviews yet. Be the first to leave one!</div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-card-top">
                      <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="review-user">{review.user_email || 'Guest'}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
