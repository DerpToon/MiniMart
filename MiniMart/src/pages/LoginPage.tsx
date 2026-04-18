import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../css/LoginPage.css'

export default function LoginPage() {
  const { signIn, resendVerificationEmail, error, successMessage } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const success = await signIn(email, password)

    setLoading(false)

    if (success) {
      navigate('/')
    }
  }

  async function handleResendVerification() {
    if (!email) return
    setResendLoading(true)
    await resendVerificationEmail(email)
    setResendLoading(false)
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <div className="auth-side-panel">
          <span className="auth-side-badge">Welcome back</span>
          <h1>Login to continue shopping on MiniMart.</h1>
          <p>
            Access your cart, place orders, and manage your account with the refreshed MiniMart UI.
          </p>
          <ul>
            <li>Track existing orders</li>
            <li>Use your saved account</li>
            <li>Continue from cart to checkout</li>
          </ul>
        </div>

        <div className="auth-card">
          <h2>Login</h2>
          <p className="auth-subtitle">Enter your account details below.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="auth-assist-row">
              <Link to="/forgot-password" className="auth-inline-link">
                Forgot password?
              </Link>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {error && <div className="auth-message error">{error}</div>}
          {error && email && /verify|verification|confirm/i.test(error) && (
            <button
              type="button"
              className="auth-resend-button"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? 'Resending...' : 'Resend verification email'}
            </button>
          )}
          {successMessage && <div className="auth-message success">{successMessage}</div>}

          <p className="auth-footer-text">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
