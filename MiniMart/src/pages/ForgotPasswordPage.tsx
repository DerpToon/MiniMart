import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordResetEmail } from '../Services/AuthService'
import { getErrorMessage } from '../lib/error'
import '../css/LoginPage.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      setLoading(true)
      await requestPasswordResetEmail(email.trim())
      setSuccess('Password reset email sent. Check your inbox for the reset link.')
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to send password reset email.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <div className="auth-side-panel">
          <span className="auth-side-badge">Password help</span>
          <h1>Reset your password through email.</h1>
          <p>
            Enter the email tied to your MiniMart account and we&apos;ll send you a secure link to
            choose a new password.
          </p>
          <ul>
            <li>Receive a secure reset link</li>
            <li>Choose a new password in one step</li>
            <li>Get back into your account quickly</li>
          </ul>
        </div>

        <div className="auth-card">
          <h2>Forgot password</h2>
          <p className="auth-subtitle">We&apos;ll email you a link to reset your password.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="Enter your account email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending reset email...' : 'Send reset email'}
            </button>
          </form>

          {error ? <div className="auth-message error">{error}</div> : null}
          {success ? <div className="auth-message success">{success}</div> : null}

          <p className="auth-footer-text">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
