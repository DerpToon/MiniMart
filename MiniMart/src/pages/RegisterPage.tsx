import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../css/RegisterPage.css'

export default function RegisterPage() {
  const { signUp, error, successMessage } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const success = await signUp(email, password)

    setLoading(false)

    if (success) {
      navigate('/login')
    }
  }

  return (
    <section className="auth-page register-variant">
      <div className="auth-layout">
        <div className="auth-side-panel">
          <span className="auth-side-badge">Create account</span>
          <h1>Join MiniMart and start placing orders in seconds.</h1>
          <p>
            The new design keeps registration simple while matching the rest of the app visually.
          </p>
          <ul>
            <li>Create your customer account</li>
            <li>Start using cart and checkout</li>
            <li>Track future orders anytime</li>
          </ul>
        </div>

        <div className="auth-card">
          <h2>Register</h2>
          <p className="auth-subtitle">Set up your MiniMart account.</p>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {error && <div className="auth-message error">{error}</div>}
          {successMessage && <div className="auth-message success">{successMessage}</div>}

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
