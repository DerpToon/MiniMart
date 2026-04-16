import { useEffect, useMemo, useState } from 'react'
import { deleteReviewById, getAllProfiles, getReviewsByUserId, updateUserRole } from '../Services/ProfileService'
import { deleteContactMessage, getContactMessages } from '../Services/ContactService'
import { getErrorMessage } from '../lib/error'
import type { ContactMessage, Profile, ProductReview } from '../types/db'
import '../css/AdminProductsPage.css'
import '../css/AdminUsersPage.css'

const USERS_PER_PAGE = 8
const MESSAGES_PER_PAGE = 6

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatLongDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function formatRoleLabel(role: Profile['role']) {
  return role === 'admin' ? 'Admin' : 'Customer'
}

function getUserInitials(fullName: string | null, id: string) {
  if (fullName?.trim()) {
    return fullName
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return id.slice(0, 2).toUpperCase()
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function getPreviewText(text: string, maxLength = 110) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

function buildVisiblePageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)
  const normalizedStart = Math.max(1, end - 4)

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [reviewList, setReviewList] = useState<ProductReview[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [submittingRole, setSubmittingRole] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [messagesPage, setMessagesPage] = useState(1)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

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

    async function loadMessages() {
      setMessagesLoading(true)
      setMessagesError(null)

      try {
        const messageItems = await getContactMessages()
        setMessages(messageItems)
      } catch (error: unknown) {
        setMessagesError(getErrorMessage(error, 'Failed to load contact messages.'))
      } finally {
        setMessagesLoading(false)
      }
    }

    loadUsers()
    loadMessages()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, sortBy])

  useEffect(() => {
    setMessagesPage(1)
  }, [messageSearchQuery])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return [...users]
      .filter((user) => (roleFilter === 'all' ? true : user.role === roleFilter))
      .filter((user) => {
        if (!normalizedQuery) return true

        const name = user.full_name?.toLowerCase() || ''
        const id = user.id.toLowerCase()
        return name.includes(normalizedQuery) || id.includes(normalizedQuery)
      })
      .sort((left, right) => {
        if (sortBy === 'name') {
          return (left.full_name || '').localeCompare(right.full_name || '')
        }

        const leftTime = new Date(left.created_at).getTime()
        const rightTime = new Date(right.created_at).getTime()
        return sortBy === 'oldest' ? leftTime - rightTime : rightTime - leftTime
      })
  }, [users, searchQuery, roleFilter, sortBy])

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
  }, [messages])

  const filteredMessages = useMemo(() => {
    const normalizedQuery = messageSearchQuery.trim().toLowerCase()

    return sortedMessages.filter((message) => {
      if (!normalizedQuery) return true

      return [message.name, message.email, message.message]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [sortedMessages, messageSearchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
  const messageTotalPages = Math.max(1, Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (messagesPage > messageTotalPages) {
      setMessagesPage(messageTotalPages)
    }
  }, [messagesPage, messageTotalPages])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const paginatedMessages = useMemo(() => {
    const startIndex = (messagesPage - 1) * MESSAGES_PER_PAGE
    return filteredMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE)
  }, [filteredMessages, messagesPage])

  useEffect(() => {
    if (paginatedMessages.length === 0) {
      if (selectedMessageId !== null) {
        setSelectedMessageId(null)
      }
      return
    }

    const hasSelectedMessageOnPage = paginatedMessages.some((message) => message.id === selectedMessageId)
    if (!hasSelectedMessageOnPage) {
      setSelectedMessageId(paginatedMessages[0].id)
    }
  }, [paginatedMessages, selectedMessageId])

  const visiblePageNumbers = useMemo(() => buildVisiblePageNumbers(currentPage, totalPages), [currentPage, totalPages])
  const visibleMessagePageNumbers = useMemo(
    () => buildVisiblePageNumbers(messagesPage, messageTotalPages),
    [messagesPage, messageTotalPages]
  )

  const selectedMessage = paginatedMessages.find((message) => message.id === selectedMessageId) || null

  const hasActiveFilters = searchQuery.trim() !== '' || roleFilter !== 'all' || sortBy !== 'newest'
  const hasMessageSearch = messageSearchQuery.trim() !== ''

  const userResultsStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1
  const userResultsEnd = Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)
  const messageResultsStart = filteredMessages.length === 0 ? 0 : (messagesPage - 1) * MESSAGES_PER_PAGE + 1
  const messageResultsEnd = Math.min(messagesPage * MESSAGES_PER_PAGE, filteredMessages.length)

  function clearSelectedUser() {
    setSelectedUser(null)
    setReviewList([])
    setReviewsLoading(false)
    setError(null)
  }

  function resetUserFilters() {
    setSearchQuery('')
    setRoleFilter('all')
    setSortBy('newest')
  }

  function resetMessageSearch() {
    setMessageSearchQuery('')
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

  async function handleDeleteContactMessage(message: ContactMessage) {
    if (!window.confirm('Delete this message? This action cannot be undone.')) {
      return
    }

    setDeletingMessageId(message.id)
    setMessagesError(null)

    try {
      await deleteContactMessage(message.id)
      setMessages((prev) => prev.filter((item) => item.id !== message.id))
      if (selectedMessageId === message.id) {
        setSelectedMessageId(null)
      }
    } catch (error: unknown) {
      setMessagesError(getErrorMessage(error, 'Failed to delete contact message.'))
    } finally {
      setDeletingMessageId(null)
    }
  }

  if (loading) {
    return (
      <section className="admin-page">
        <div className="admin-shell">
          <div className="admin-state">Loading users...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-page">
        <div className="admin-shell">
          <div className="admin-state error">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="admin-shell">
        <header className="admin-header-block">
          <div>
            <p className="admin-kicker">Admin / Users</p>
            <h1>Manage users and review activity</h1>
            <p>Search user accounts, update roles, and moderate messages from one workspace.</p>
          </div>

          <div className="admin-header-actions">
            <div className="admin-stat-pill">{formatCount(users.length, 'user')}</div>
            <div className="admin-stat-pill subtle">{formatCount(sortedMessages.length, 'message')}</div>
            <div className="admin-stat-pill subtle">{formatCount(filteredUsers.length, 'match')}</div>
          </div>
        </header>

        <div className="admin-users-workspace">
          <aside className="admin-form-card admin-user-details-card">
            <div className="admin-card-head">
              <h2>User details</h2>
              <p>Select a user to see reviews, moderate comments, and change the account role.</p>
            </div>

            {selectedUser ? (
              <div className="admin-user-panel">
                <div className="admin-user-meta">
                  <div className="admin-user-identity">
                    <div className="admin-user-avatar-badge">
                      {getUserInitials(selectedUser.full_name, selectedUser.id)}
                    </div>

                    <div className="admin-user-identity-copy">
                      <strong>{selectedUser.full_name || 'Unknown user'}</strong>
                      <span>ID: {selectedUser.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <span className={`admin-user-role-chip ${selectedUser.role}`}>
                    {formatRoleLabel(selectedUser.role)}
                  </span>
                </div>

                <div className="admin-user-stats-grid">
                  <div className="admin-user-stat-card">
                    <span>Joined</span>
                    <strong>{formatShortDate(selectedUser.created_at)}</strong>
                  </div>

                  <div className="admin-user-stat-card">
                    <span>Reviews loaded</span>
                    <strong>{reviewList.length}</strong>
                  </div>
                </div>

                <label className="admin-user-role-control">
                  <span>Role</span>
                  <div className="admin-user-role-select-wrap">
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as 'customer' | 'admin')}
                      disabled={submittingRole}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </label>

                <div className="admin-user-card-footer">
                  <div className="admin-user-selection-note">Selected for review moderation</div>
                  <button className="admin-user-clear-btn" type="button" onClick={clearSelectedUser}>
                    Clear selection
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-user-empty">
                <strong>No user selected</strong>
                <p>Choose an account from the directory to review comments and update the account role.</p>
              </div>
            )}
          </aside>

          <div className="admin-users-main">
            <section className="admin-table-card admin-users-table-card">
              <div className="admin-table-head admin-users-table-head">
                <div>
                  <h2>User directory</h2>
                </div>

                <div className="admin-users-table-head-pill">{formatCount(filteredUsers.length, 'account')}</div>
              </div>

              <div className="admin-users-toolbar">
                <label className="admin-users-toolbar-field search">
                  <span>Search users</span>
                  <div className="admin-users-input-shell">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by name or ID"
                    />
                  </div>
                </label>

                <label className="admin-users-toolbar-field compact">
                  <span>Role</span>
                  <div className="admin-users-select-shell">
                    <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | 'admin' | 'customer')}>
                      <option value="all">All roles</option>
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </label>

                <label className="admin-users-toolbar-field compact">
                  <span>Sort by</span>
                  <div className="admin-users-select-shell">
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'newest' | 'oldest' | 'name')}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </label>

                {hasActiveFilters && (
                  <button type="button" className="admin-users-reset-btn" onClick={resetUserFilters}>
                    Reset filters
                  </button>
                )}
              </div>

              <div className="admin-users-toolbar-meta">
                <span>
                  {filteredUsers.length === 0
                    ? 'No users match the current filters.'
                    : `Showing ${userResultsStart}-${userResultsEnd} of ${filteredUsers.length}`}
                </span>
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
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="admin-empty-row">
                          No users match the current search and filter settings.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className={selectedUser?.id === user.id ? 'is-selected' : undefined}>
                          <td>
                            <div className="admin-user-row-main">
                              <div className="admin-user-avatar-badge small">
                                {getUserInitials(user.full_name, user.id)}
                              </div>

                              <div className="admin-user-name-cell">
                                <strong>{user.full_name || 'Unnamed user'}</strong>
                                <span>ID: {user.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="admin-user-role-cell">
                            <span className={`admin-user-role-chip ${user.role}`}>
                              {formatRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="admin-user-date-cell">{formatShortDate(user.created_at)}</td>
                          <td className="admin-user-action-cell">
                            <button
                              className={`admin-secondary-btn admin-user-action-btn ${selectedUser?.id === user.id ? 'active' : ''}`}
                              type="button"
                              onClick={() => loadUserReviews(user)}
                            >
                              {selectedUser?.id === user.id ? 'Hide panel' : 'Open profile'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="admin-pagination">
                  <span>Page {currentPage} of {totalPages}</span>

                  <div className="pagination-buttons">
                    <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                      Prev
                    </button>

                    {visiblePageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={pageNumber === currentPage ? 'active' : undefined}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="admin-table-card admin-user-reviews-card">
              <div className="admin-table-head admin-section-head">
                <div>
                  <h3>{selectedUser ? `Reviews by ${selectedUser.full_name || selectedUser.id}` : 'Review moderation'}</h3>
                </div>

                <div className="admin-section-pill">{formatCount(reviewList.length, 'review')}</div>
              </div>

              <div className="admin-section-body">
                {!selectedUser ? (
                  <p className="admin-section-empty">No user is selected yet.</p>
                ) : reviewsLoading ? (
                  <p className="admin-section-empty">Loading reviews...</p>
                ) : reviewList.length === 0 ? (
                  <p className="admin-section-empty">No reviews found for this user.</p>
                ) : (
                  <div className="admin-review-list">
                    {reviewList.map((review) => (
                      <article key={review.id} className="review-card">
                        <div className="review-card-top">
                          <span className="review-stars">{`${'\u2605'}`.repeat(review.rating)}{`${'\u2606'}`.repeat(5 - review.rating)}</span>
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
                        <p className="review-date">{formatShortDate(review.created_at)}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="admin-table-card admin-contact-card">
              <div className="admin-table-head admin-section-head">
                <div>
                  <h3>Customer messages</h3>
                </div>

                <div className="admin-section-pill">{formatCount(filteredMessages.length, 'message')}</div>
              </div>

              <div className="admin-message-toolbar">
                <label className="admin-users-toolbar-field search">
                  <span>Search inbox</span>
                  <div className="admin-users-input-shell">
                    <input
                      type="text"
                      value={messageSearchQuery}
                      onChange={(event) => setMessageSearchQuery(event.target.value)}
                      placeholder="Search by sender, email, or message content"
                    />
                  </div>
                </label>

                <div className="admin-message-toolbar-meta">
                  <span>
                    {filteredMessages.length === 0
                      ? 'No messages match the current search.'
                      : `Showing ${messageResultsStart}-${messageResultsEnd} of ${filteredMessages.length}`}
                  </span>

                  {hasMessageSearch && (
                    <button type="button" className="admin-users-reset-btn admin-message-reset-btn" onClick={resetMessageSearch}>
                      Reset search
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-section-body">
                {messagesLoading ? (
                  <p className="admin-section-empty">Loading contact messages...</p>
                ) : messagesError ? (
                  <p className="admin-section-error">{messagesError}</p>
                ) : filteredMessages.length === 0 ? (
                  <p className="admin-section-empty">No contact messages match the current search.</p>
                ) : (
                  <div className="admin-message-inbox">
                    <div className="admin-message-list-panel">
                      <div className="admin-message-list">
                        {paginatedMessages.map((message) => (
                          <button
                            key={message.id}
                            type="button"
                            className={`admin-message-list-item ${selectedMessage?.id === message.id ? 'active' : ''}`}
                            onClick={() => setSelectedMessageId(message.id)}
                          >
                            <div className="admin-message-list-top">
                              <strong>{message.name}</strong>
                              <span>{formatShortDate(message.created_at)}</span>
                            </div>
                            <span className="admin-message-list-email">{message.email}</span>
                            <p className="admin-message-list-preview">{getPreviewText(message.message)}</p>
                          </button>
                        ))}
                      </div>

                      {messageTotalPages > 1 && (
                        <div className="admin-message-pagination">
                          <div className="pagination-buttons">
                            <button type="button" onClick={() => setMessagesPage((page) => Math.max(1, page - 1))} disabled={messagesPage === 1}>
                              Prev
                            </button>

                            {visibleMessagePageNumbers.map((pageNumber) => (
                              <button
                                key={pageNumber}
                                type="button"
                                className={pageNumber === messagesPage ? 'active' : undefined}
                                onClick={() => setMessagesPage(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={() => setMessagesPage((page) => Math.min(messageTotalPages, page + 1))}
                              disabled={messagesPage === messageTotalPages}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="admin-message-preview-card">
                      {selectedMessage ? (
                        <>
                          <div className="admin-message-preview-head">
                            <div className="admin-message-preview-meta">
                              <strong>{selectedMessage.name}</strong>
                              <span>{selectedMessage.email}</span>
                            </div>

                            <span className="admin-message-preview-date">
                              {formatLongDate(selectedMessage.created_at)}
                            </span>
                          </div>

                          <div className="admin-message-preview-body">{selectedMessage.message}</div>

                          <div className="admin-message-preview-actions">
                            <button
                              type="button"
                              className="review-delete-btn"
                              onClick={() => handleDeleteContactMessage(selectedMessage)}
                              disabled={deletingMessageId === selectedMessage.id}
                            >
                              {deletingMessageId === selectedMessage.id ? 'Deleting...' : 'Delete message'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="admin-section-empty">Select a message to read it.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
