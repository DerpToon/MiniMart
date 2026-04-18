import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signOutUser, updatePassword } from '../Services/AuthService'
import { getErrorMessage } from '../lib/error'
import { useAuth } from '../hooks/useAuth'
import '../css/LoginPage.css'

export default function ResetPasswordPage() {
  const { user, loading: authLoading } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSaving(true)
      await updatePassword(newPassword)
      await signOutUser()
      setSuccess('Password updated. You can now sign in with your new password.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to update password.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-layout auth-layout-single">
        <div className="auth-card">
          <h2>Reset password</h2>
          <p className="auth-subtitle">Set your new password below.</p>

          {authLoading ? <div className="auth-message success">Checking your reset link...</div> : null}

          {!authLoading && !user ? (
            <>
              <div className="auth-message error">
                This reset link is invalid or expired. Request a new password reset email and try again.
              </div>

              <p className="auth-footer-text">
                Need a new link? <Link to="/forgot-password">Reset through email</Link>
              </p>
            </>
          ) : null}

          {!authLoading && user ? (
            <>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-field">
                  <span>New password</span>
                  <input
                    type="password"
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>

                <button className="auth-submit" type="submit" disabled={saving}>
                  {saving ? 'Updating password...' : 'Update password'}
                </button>
              </form>

              {error ? <div className="auth-message error">{error}</div> : null}
              {success ? <div className="auth-message success">{success}</div> : null}

              <p className="auth-footer-text">
                Back to <Link to="/login">Login</Link>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
