import { useEffect, useState } from 'react'
import type { ProfileFormData, ProfileView } from '../types/db'
import { getMyProfileView, updateMyProfile } from '../Services/ProfileService'
import { getErrorMessage } from '../lib/error'
import '../css/ProfilePage.css'

const initialForm: ProfileFormData = {
  full_name: '',
  email: '',
  new_password: '',
  confirm_password: ''
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [form, setForm] = useState<ProfileFormData>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyProfileView()
        setProfile(data)
        setForm({
          full_name: data.full_name ?? '',
          email: data.email,
          new_password: '',
          confirm_password: ''
        })
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to load profile.'))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.new_password && form.new_password.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSaving(true)

      const updatedProfile = await updateMyProfile({
        full_name: form.full_name,
        email: form.email,
        new_password: form.new_password || undefined
      })

      setProfile(updatedProfile)
      setForm({
        full_name: updatedProfile.full_name ?? '',
        email: updatedProfile.email,
        new_password: '',
        confirm_password: ''
      })

      setSuccess(
        'Profile updated successfully. If you changed your email, check your inbox for confirmation.'
      )
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString()
  }

  const initials =
    profile?.full_name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') ||
    profile?.email?.charAt(0).toUpperCase() ||
    'U'

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card profile-loading">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-hero-copy">
            <p className="profile-kicker">My profile</p>
            <h1>Manage your account</h1>
            <p>View your profile details and update your basic account information.</p>
          </div>
        </section>

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Edit profile</h2>
                <p>Update your name, email, or password.</p>
              </div>
            </div>

            {error ? <div className="profile-alert error">{error}</div> : null}
            {success ? <div className="profile-alert success">{success}</div> : null}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </label>

                <label className="profile-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                </label>

                <label className="profile-field">
                  <span>New password</span>
                  <input
                    type="password"
                    name="new_password"
                    value={form.new_password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />
                </label>

                <label className="profile-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                  />
                </label>
              </div>

              <div className="profile-actions">
                <button className="profile-save-button" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          <aside className="profile-card profile-summary">
            <h2>Account overview</h2>

            <div className="profile-summary-list">
              <div className="profile-summary-item">
                <span>Full name</span>
                <strong>{profile?.full_name || 'Not set'}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Email</span>
                <strong>{profile?.email || '—'}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Role</span>
                <strong className="profile-role">{profile?.role || 'customer'}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Created at</span>
                <strong>{formatDate(profile?.created_at || '')}</strong>
              </div>

              <div className="profile-summary-item">
                <span>User ID</span>
                <strong className="profile-mono">{profile?.id || '—'}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
