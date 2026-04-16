import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendContactMessage } from '../Services/ContactService'
import contactHeroImage from '../assets/contact-hero-market.jpg'
import '../css/ContactPage.css'

const messageTips = [
  'Your order number if the message is about a recent purchase.',
  'The product name or category if you are asking about stock.',
  'A clear email address so the MiniMart team can follow up quickly.'
] as const

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
        <header
          className="contact-hero"
          style={{
            backgroundImage: `linear-gradient(
              90deg,
              rgba(9, 33, 25, 0.78) 0%,
              rgba(11, 39, 30, 0.66) 32%,
              rgba(12, 44, 34, 0.44) 58%,
              rgba(12, 44, 34, 0.2) 80%,
              rgba(12, 44, 34, 0.08) 100%
            ), url(${contactHeroImage})`,
            backgroundPosition: 'center center'
          }}
        >
          <div className="contact-hero-copy">
            <p className="contact-kicker">Contact us</p>
            <h1>Questions about an order or today&apos;s groceries? Contact MiniMart.</h1>
            <p>
              Whether you need help with delivery, want to ask about product availability, or just have
              feedback for the store, send us a message and the MiniMart team will review it quickly.
            </p>
            <div className="contact-hero-actions">
              <Link to="/about" className="contact-hero-link">
                Learn more about MiniMart
              </Link>
            </div>
          </div>
        </header>

        <div className="contact-content">
          <aside className="contact-info-card">
            <p className="contact-info-kicker">MiniMart support</p>
            <h2>What to include</h2>
            <p>
              A little detail helps us respond faster and gives the store team enough context to help
              with your request the first time.
            </p>

            <div className="contact-tip-list">
              {messageTips.map((tip, index) => (
                <div key={tip} className="contact-tip-item">
                  <span className="contact-tip-index">0{index + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </aside>

          <main className="contact-form-card">
            <h2>Send us a message</h2>
            <p>We&apos;ll review your message and follow up if we need anything else.</p>

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
