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
    <section className="register-page">
      <div className="register-card">
        <h1 className="register-title">Create account</h1>
        <p className="register-subtitle">Join MiniMart and start shopping</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label className="register-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className="register-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="register-input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="register-button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {error && <p className="register-error">{error}</p>}
        {successMessage && <p className="register-success">{successMessage}</p>}

        <p className="register-footer">
          Already have an account?{' '}
          <Link className="register-link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  )
}