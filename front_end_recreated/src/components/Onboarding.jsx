import React, {useState} from 'react'
import './onboarding.css'
import {BrandLockup} from './BrandLogo'
import Icon from './Icon'
import findImg from '../assets/onboarding/find-rentals.jpg'
import verifiedImg from '../assets/onboarding/verified-locations.jpg'
import connectImg from '../assets/onboarding/connect-brokers.jpg'
import manageImg from '../assets/onboarding/manage-properties.jpg'

const items = [
  {
    title: 'Find Rentals Faster',
    description: 'Browse houses, apartments, and rooms from trusted brokers across Tanzania.',
    icon: 'travel_explore',
    image: findImg,
  },
  {
    title: 'Verified Property Locations',
    description: 'Discover properties with real GPS-verified locations for easier navigation and trust.',
    icon: 'verified',
    image: verifiedImg,
  },
  {
    title: 'Connect Directly with Brokers',
    description: 'Chat, call, or message brokers instantly to secure your next home faster.',
    icon: 'mark_chat_unread',
    image: connectImg,
  },
  {
    title: 'Post & Manage Properties',
    description: 'Switch to seller mode, upload listings with photos, and manage rental properties professionally.',
    icon: 'apartment',
    image: manageImg,
  },
]

export default function Onboarding({onFinish}) {
  const [page, setPage] = useState(0)
  const item = items[page]

  function finish() {
    localStorage.setItem('has_seen_onboarding_v1', 'true')
    onFinish?.()
  }

  return (
    <main className="onboarding-screen">
      <section className="onboarding-frame">
        <aside className="onboarding-showcase">
          <BrandLockup light />
          <div className="showcase-spacer" />
          <Icon name="real_estate_agent" className="huge" />
          <h1>Find Verified Rental Properties Across Tanzania</h1>
          <p>Smarter Rental Connections</p>
        </aside>

        <div className="onboarding-pager">
          <article className="onboarding-slide">
            <img src={item.image} alt="" />
            <div className="slide-shade" />
            <div className="slide-copy">
              <Icon name={item.icon} className="slide-icon" />
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </article>
          <div className="pager-dots" aria-label="Onboarding progress">
            {items.map((_, index) => (
              <button
                key={index}
                className={index === page ? 'dot active' : 'dot'}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setPage(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <nav className="onboarding-actions">
        <button className="text-button" onClick={finish}>Skip</button>
        <button
          className="filled-button"
          onClick={() => (page === items.length - 1 ? finish() : setPage(page + 1))}
        >
          {page === items.length - 1 ? 'Start Browsing' : 'Next'}
        </button>
      </nav>
    </main>
  )
}
