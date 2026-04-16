import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import aboutHeroImage from '../assets/about-hero-market.jpg'
import '../css/AboutPage.css'

const aboutFeatures = [
  {
    id: '01',
    icon: 'produce',
    title: 'Fresh food every day',
    description:
      'From crisp produce and dairy to bakery picks and pantry basics, MiniMart keeps the everyday essentials you need stocked and ready.',
    accent: '#1b6b59',
    soft: '#edf6f1'
  },
  {
    id: '02',
    icon: 'delivery',
    title: 'Fast local delivery',
    description:
      'Need a quick restock? MiniMart makes it easy to place an order and get groceries delivered without turning a simple shop into a long task.',
    accent: '#5f8dcf',
    soft: '#edf4ff'
  },
  {
    id: '03',
    icon: 'service',
    title: 'Friendly neighborhood service',
    description:
      'We want MiniMart to feel like a shop you can rely on. If you need help with an order or have a question, our team is easy to reach.',
    accent: '#b67843',
    soft: '#f9f0e7'
  },
  {
    id: '04',
    icon: 'quality',
    title: 'Simple everyday shopping',
    description:
      'MiniMart is built around convenience: clear categories, reliable stock, fair prices, and a smoother way to shop for the essentials.',
    accent: '#6c9640',
    soft: '#eef6e5'
  }
] as const

function renderAboutIcon(icon: (typeof aboutFeatures)[number]['icon']): ReactNode {
  if (icon === 'produce') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20c4.418 0 8-2.91 8-6.5S16.418 7 12 7 4 9.91 4 13.5 7.582 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 7c0-1.657 1.343-3 3-3 0 1.657-1.343 3-3 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 10.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === 'delivery') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 7.5h10v8h-10v-8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14.5 10h2.7l2.3 2.6v2.9h-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (icon === 'service') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7.5A4.5 4.5 0 0 1 10.5 3h3A4.5 4.5 0 0 1 18 7.5v3A4.5 4.5 0 0 1 13.5 15H11l-3.5 3v-3.3A4.48 4.48 0 0 1 6 10.5v-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 8.5h5M9.5 11.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === 'quality') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4.5 6 7.5v4.2c0 3.4 2.3 6.6 6 7.8 3.7-1.2 6-4.4 6-7.8V7.5l-6-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 12.5 11 14l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-shell">
        <header className="about-hero">
          <img src={aboutHeroImage} alt="" aria-hidden="true" className="about-hero-bg" />
          <div className="about-hero-copy">
            <h1>Fresh groceries, fast delivery, and everyday essentials from MiniMart.</h1>
            <p>
              MiniMart is your neighborhood grocery shop for fresh food, pantry basics, and the
              everyday items people need most. We focus on reliable service, fair prices, and a faster
              way to stock up without the usual hassle.
            </p>
            <Link to="/contact" className="about-hero-link">
              Send us a message
            </Link>
          </div>
        </header>

        <div className="about-grid">
          {aboutFeatures.map((feature) => (
            <article
              className="about-card"
              key={feature.id}
              style={
                {
                  '--about-accent': feature.accent,
                  '--about-soft': feature.soft
                } as CSSProperties
              }
            >
              <div className="about-card-top">
                <span className="about-card-icon">{renderAboutIcon(feature.icon)}</span>
                <span className="about-card-index">{feature.id}</span>
              </div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
