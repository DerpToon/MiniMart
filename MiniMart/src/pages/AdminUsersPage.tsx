import { useEffect, useMemo, useState } from 'react'
import { deleteReviewById, getAllProfiles, getReviewsByUserId, updateUserRole } from '../Services/ProfileService'
import { getErrorMessage } from '../lib/error'
import type { Profile, ProductReview } from '../types/db'
import '../css/AdminProductsPage.css'
import '../css/AdminUsersPage.css'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [reviewList, setReviewList] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittingRole, setSubmittingRole] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError(null)

      try {
        const data = await getAllProfiles()
        setUsers(data)
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to load users.'))
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const userReviewCounts = useMemo(() => {
    return reviewList.reduce<Record<string, number>>((counts, review) => {
      if (!review.user_id) return counts
      counts[review.user_id] = (counts[review.user_id] || 0) + 1
      return counts
    }, {})
  }, [reviewList])

  function clearSelectedUser() {
    setSelectedUser(null)
    setReviewList([])
    setReviewsLoading(false)
    setError(null)
  }

  async function loadUserReviews(user: Profile) {
    if (selectedUser?.id === user.id) {
      clearSelectedUser()
      return
    }

    setSelectedUser(user)
    setReviewsLoading(true)
    setError(null)

    try {
      const reviews = await getReviewsByUserId(user.id)
      setReviewList(reviews)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load user reviews.'))
    } finally {
      setReviewsLoading(false)
    }
  }

  async function handleRoleChange(userId: string, role: 'customer' | 'admin') {
    setSubmittingRole(true)
    setError(null)

    try {
      await updateUserRole(userId, role)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role })
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to update user role.'))
    } finally {
      setSubmittingRole(false)
    }
  }

  async function handleDeleteReview(review: ProductReview) {
    if (!window.confirm('Delete this review? This action cannot be undone.')) {
      return
    }

    setDeletingReviewId(review.id)
    setError(null)

    try {
      await deleteReviewById(review.id)
      setReviewList((prev) => prev.filter((item) => item.id !== review.id))
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to delete review.'))
    } finally {
      setDeletingReviewId(null)
    }
  }

  if (loading) {
    return <section className="admin-page"><div className="admin-shell"><div className="admin-state">Loading users...</div></div></section>
  }

  if (error) {
    return <section className="admin-page"><div className="admin-shell"><div className="admin-state error">{error}</div></div></section>
  }

  return (
    <section className="admin-page">
      <div className="admin-shell">
        <header className="admin-header-block">
          <div>
            <p className="admin-kicker">Admin / Users</p>
            <h1>Manage users and review activity</h1>
            <p>Update user roles and inspect customer comments from the review table.</p>
          </div>

          <div className="admin-header-actions">
            <div className="admin-stat-pill">{users.length} users</div>
          </div>
        </header>

        <div className="admin-grid-layout">
          <aside className="admin-form-card admin-user-details-card">
            <div className="admin-card-head">
              <h2>User details</h2>
              <p>Select a user to see their reviews and change their role.</p>
            </div>

            {selectedUser ? (
              <div className="admin-user-panel">
                <div className="admin-user-meta">
                  <strong>{selectedUser.full_name || 'Unknown user'}</strong>
                  <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>

                <label className="admin-user-role-control">
                  <span>Role</span>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as 'customer' | 'admin')}
                    disabled={submittingRole}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <div className="admin-user-card-footer">
                  <div>{userReviewCounts[selectedUser.id] || 0} reviews</div>
                  <button
                    className="admin-user-clear-btn"
                    type="button"
                    onClick={clearSelectedUser}
                  >
                    Hide reviews
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-user-empty">
                Select a user from the list to view their reviews.
              </div>
            )}
          </aside>

          <main className="admin-table-card admin-users-table-card">
            <div className="admin-table-head">
              <h2>User accounts</h2>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-products-table admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={selectedUser?.id === user.id ? 'is-selected' : undefined}
                    >
                      <td>
                        <div className="admin-user-name-cell">
                          <strong>{user.full_name || 'Unnamed user'}</strong>
                          <span>ID: {user.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="admin-user-role-cell">
                        <span className={`admin-user-role-chip ${user.role}`}>{user.role}</span>
                      </td>
                      <td className="admin-user-date-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="admin-user-action-cell">
                        <button
                          className={`admin-secondary-btn admin-user-action-btn ${selectedUser?.id === user.id ? 'active' : ''}`}
                          type="button"
                          onClick={() => loadUserReviews(user)}
                        >
                          {selectedUser?.id === user.id ? 'Hide reviews' : 'View reviews'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedUser && (
                <div className="admin-user-reviews-panel">
                  <h3>Reviews by {selectedUser.full_name || selectedUser.id}</h3>
                  {reviewsLoading ? (
                    <p>Loading reviews...</p>
                  ) : reviewList.length === 0 ? (
                    <p>No reviews found for this user.</p>
                  ) : (
                    reviewList.map((review) => (
                      <article key={review.id} className="review-card">
                        <div className="review-card-top">
                          <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          <div className="review-card-actions">
                            <span className="review-user">{review.user_email || 'Guest'}</span>
                            <button
                              className="review-delete-btn"
                              type="button"
                              onClick={() => handleDeleteReview(review)}
                              disabled={deletingReviewId === review.id}
                            >
                              {deletingReviewId === review.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
