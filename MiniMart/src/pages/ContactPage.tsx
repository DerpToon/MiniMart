import { FormEvent, useState } from 'react'
import { sendContactMessage } from '../Services/ContactService'
import { Link } from 'react-router-dom'
import '../css/ContactPage.css'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields before sending your message.')
      return
    }

    setStatus('submitting')

    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim()
      })
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (submitError) {
      setError('We could not submit your message right now. Please try again in a moment.')
      console.error(submitError)
      setStatus('idle')
    }
  }

  return (
    <section className="contact-page">
      <div className="contact-shell">
        <header className="contact-hero">
          <div>
            <p className="contact-kicker">Contact us</p>
            <h1>Send a message and we'll get back to you quickly.</h1>
            <p>
              Have a question about an order, a product, or the MiniMart experience? Use the form below
              and our team will review your message in the admin dashboard.
            </p>
            <Link to="/about" className="contact-hero-link">
              Learn more about MiniMart
            </Link>
          </div>
        </header>

        <div className="contact-content">
          <aside className="contact-info-card">
            <h2>Need help fast?</h2>
            <p>
              We monitor customer messages directly from the admin dashboard, so your request will be
              visible to our team right away.
            </p>
            <ul>
              <li>General questions</li>
              <li>Product feedback</li>
              <li>Cart or order support</li>
              <li>Feature requests</li>
            </ul>
          </aside>

          <main className="contact-form-card">
            <h2>Send us a message</h2>
            <p>We’ll review your message in the admin panel and follow up if needed.</p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label>
                <span>Message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what you need..."
                  rows={8}
                />
              </label>

              {error && <div className="contact-error">{error}</div>}
              {status === 'success' && <div className="contact-success">Message sent. Thank you!</div>}

              <button type="submit" className="contact-submit-btn" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </main>
        </div>
      </div>
    </section>
  )
}
