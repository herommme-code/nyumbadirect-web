import React, {useEffect, useRef, useState} from 'react'
import AppShell from './components/AppShell'
import {BrandLogoMark, BrandWordmark} from './components/BrandLogo'
import Icon from './components/Icon'
import {googleLogin, loginUser, registerUser} from './api/nyumbaApi'
import findImg from './assets/onboarding/find-rentals.jpg'
import './index.css'

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || '620083900279-8ilaua6tn1nqke1mg9irhn7ecbrbiicr.apps.googleusercontent.com'

export default function App() {
  const [session, setSession] = useState(() => localStorage.getItem('nyumba_session_email') || '')
  const [showAppPromo, setShowAppPromo] = useState(false)

  const dismissAppPromo = () => {
    if (session) localStorage.setItem(appPromoKey(session), 'seen')
    setShowAppPromo(false)
  }

  if (session) {
    return <>
      <AppShell sessionEmail={session} onLogout={() => {
        localStorage.removeItem('nyumba_session_email')
        setSession('')
        setShowAppPromo(false)
      }} />
      {showAppPromo && <MobileAppPromo onDismiss={dismissAppPromo} />}
    </>
  }

  return <AuthLanding onAuthenticated={(email) => {
    localStorage.setItem('nyumba_session_email', email)
    setSession(email)
    if (localStorage.getItem(appPromoKey(email)) !== 'seen') setShowAppPromo(true)
  }} />
}

function appPromoKey(email) {
  return `nyumba_mobile_app_promo_seen:${`${email || ''}`.trim().toLowerCase()}`
}

function MobileAppPromo({onDismiss}) {
  return (
    <div className="mobile-app-promo-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onDismiss()
    }}>
      <section className="mobile-app-promo" role="dialog" aria-modal="true" aria-labelledby="mobile-app-promo-title">
        <button className="mobile-app-promo-close" type="button" onClick={onDismiss} aria-label="Close app promotion">
          <Icon name="close" />
        </button>
        <div className="mobile-app-promo-visual" aria-hidden="true">
          <div className="mobile-app-promo-phone">
            <span className="mobile-app-promo-speaker" />
            <div className="mobile-app-promo-screen">
              <BrandLogoMark size={34} />
              <span>NyumbaDirect</span>
              <div className="mobile-app-promo-listing"><Icon name="location_on" /><i /><i /></div>
              <div className="mobile-app-promo-listing"><Icon name="verified" /><i /><i /></div>
            </div>
          </div>
          <span className="mobile-app-promo-orbit orbit-one" />
          <span className="mobile-app-promo-orbit orbit-two" />
        </div>
        <div className="mobile-app-promo-copy">
          <p className="mobile-app-promo-eyebrow">NyumbaDirect for Android</p>
          <h1 id="mobile-app-promo-title">Your next home is always within reach.</h1>
          <p>Take verified listings, saved homes, and direct conversations with you—wherever you go.</p>
        </div>
        <div className="mobile-app-promo-actions">
          <a
            className="mobile-app-promo-download"
            href="https://play.google.com/store/apps/details?id=com.nyumbadirect.app&pcampaignid=web_share"
            target="_blank"
            rel="noreferrer"
            onClick={onDismiss}
          >
            <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" />
          </a>
          <button className="mobile-app-promo-later" type="button" onClick={onDismiss}>Maybe later</button>
        </div>
      </section>
    </div>
  )
}

function AuthLanding({onAuthenticated}) {
  const googleButtonRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authAction, setAuthAction] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 980 : false)
  const [mobileStep, setMobileStep] = useState('onboarding')

  const authenticate = async (nextAction) => {
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Email is required.')
      return
    }
    if (!cleanEmail.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    if (nextAction === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setAuthAction(nextAction)
    setError('')
    try {
      const result = nextAction === 'register'
        ? await registerUser({email: cleanEmail, password})
        : await loginUser({email: cleanEmail, password})
      onAuthenticated(result.email || cleanEmail)
    } catch (error) {
      setError(error.message || 'Network request failed.')
    } finally {
      setLoading(false)
      setAuthAction('')
    }
  }

  const submit = (event) => {
    event.preventDefault()
    authenticate('login')
  }

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      setError('Google did not return an identity token.')
      return
    }
    setGoogleLoading(true)
    setError('')
    try {
      const result = await googleLogin({idToken: response.credential})
      onAuthenticated(result.email || 'google-user@nyumbadirect.local')
    } catch (error) {
      setError(error.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    loadGoogleIdentityServices()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        window.google.accounts.id.disableAutoSelect?.()
        window.google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: false,
          callback: handleGoogleCredential,
        })
        setGoogleReady(true)
      })
      .catch(() => setError('Could not load Google sign-in. Check your internet connection.'))

    return () => {
      cancelled = true
    }
  }, [onAuthenticated])

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current || !window.google?.accounts?.id) return

    const container = googleButtonRef.current
    container.innerHTML = ''
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.max(240, Math.round(container.getBoundingClientRect().width || 320)),
    })
  }, [googleReady, isMobile, mobileStep])

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth <= 980)
    updateMobileState()
    window.addEventListener('resize', updateMobileState)

    return () => window.removeEventListener('resize', updateMobileState)
  }, [])

  useEffect(() => {
    if (!isMobile) setMobileStep('onboarding')
  }, [isMobile])

  const authForm = (
    <form className="auth-form-card" onSubmit={submit}>
      {isMobile && (
        <button className="auth-mobile-back" type="button" onClick={() => setMobileStep('onboarding')} aria-label="Back to onboarding">
          <Icon name="arrow_back_rounded" />
        </button>
      )}
      <h2>Login to NyumbaDirect</h2>
      <label className="auth-input">
        <input
          type="email"
          value={email}
          placeholder="Email address"
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="auth-input">
        <div>
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            placeholder="Password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'}>
            <Icon name={passwordVisible ? 'visibility_off_outlined' : 'visibility_outlined'} />
          </button>
        </div>
      </label>
      {error && <strong className="auth-error">{error}</strong>}
      <div className="auth-action-row">
        <button className="auth-submit" type="submit" disabled={loading || googleLoading}>
          {loading && authAction === 'login' ? 'Signing in...' : 'Sign in'}
        </button>
        <button className="auth-create-button" type="button" disabled={loading || googleLoading} onClick={() => authenticate('register')}>
          {loading && authAction === 'register' ? 'Creating...' : 'Sign up'}
        </button>
      </div>
      <div className="auth-google-divider"><span>or continue with</span></div>
      <div className={`auth-google-shell ${googleLoading ? 'loading' : ''}`}>
        <button className="auth-google-button" type="button" disabled={!googleReady || googleLoading} tabIndex={-1} aria-hidden="true">
          <span className="auth-google-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3h3.87c2.26-2.08 3.55-5.15 3.55-8.64Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.95H1.27v3.09C3.24 21.29 7.29 24 12 24Z" />
              <path fill="#FBBC05" d="M5.27 14.28A7.22 7.22 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.27A11.96 11.96 0 0 0 0 12c0 1.93.46 3.75 1.27 5.37l4-3.09Z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.21 15.23 0 12 0 7.29 0 3.24 2.71 1.27 6.63l4 3.09C6.22 6.88 8.87 4.77 12 4.77Z" />
            </svg>
          </span>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>
        <div className="auth-google-hit-target" ref={googleButtonRef} aria-label="Continue with Google" />
      </div>
      <div className="auth-trust-row" aria-label="Nyumbadirect trust features">
        <span><Icon name="verified" /> GPS verified</span>
        <span><Icon name="chat_bubble_rounded" /> Owner/broker chat</span>
        <span><Icon name="privacy_tip" /> Secure account</span>
      </div>
      <div className="auth-meta-lockup">
        <BrandLogoMark size={38} />
        <BrandWordmark fontSize={20} />
      </div>
    </form>
  )

  if (isMobile && mobileStep === 'onboarding') {
    return (
      <main className="auth-mobile-flow">
        <section className="auth-mobile-onboarding">
          <div className="auth-mobile-onboarding-top">
            <BrandLogoMark size={58} light />
          </div>
          <div className="auth-mobile-onboarding-body">
            <article className="auth-mobile-preview-card">
              <img src={findImg} alt="" />
              <div className="auth-mobile-preview-overlay">
                <span><Icon name="gps_fixed" /> GPS ready</span>
                <button type="button" aria-label="Save sample home"><Icon name="favorite_border" /></button>
              </div>
              <div>
                <strong>Masaki Apartment</strong>
                <small>2 beds · verified property</small>
              </div>
            </article>
            <h1>Verified properties, direct access.</h1>
            <p>Discover rentals, homes for sale, and plots from owners or brokers in one NyumbaDirect account.</p>
          </div>
          <button className="auth-mobile-start" type="button" onClick={() => setMobileStep('login')}>
            Get started
          </button>
        </section>
      </main>
    )
  }

  if (isMobile) {
    return (
      <main className="auth-mobile-flow auth-mobile-login">
        <section className="auth-mobile-login-panel">
          {authForm}
        </section>
      </main>
    )
  }

  return (
    <main className="auth-landing auth-unified-mode">
      <section className="auth-showcase">
        <div className="auth-facebook-structure">
          <BrandLogoMark size={74} light />
          <div className="auth-register-scene">
            <div className="auth-register-copy">
              <h1>One account for trusted properties.</h1>
              <p>Find verified rentals, homes for sale, plots, and direct owner or broker support without switching pages.</p>
            </div>
            <article className="auth-feature-property">
              <img src={findImg} alt="" />
              <div className="auth-feature-overlay">
                <span><Icon name="gps_fixed" /> GPS ready</span>
                <button type="button" aria-label="Save sample home"><Icon name="favorite_border" /></button>
              </div>
              <div className="auth-feature-body">
                <div>
                  <h3>Masaki Apartment</h3>
                  <p>2 beds · premium broker</p>
                </div>
                <strong><Icon name="verified" /> Verified</strong>
              </div>
            </article>
            <div className="auth-register-metrics" aria-hidden="true">
              <span><strong>GPS</strong> verified locations</span>
              <span><strong>Direct</strong> owner or broker access</span>
              <span><strong>Trusted</strong> property tools</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        {authForm}
      </section>
    </main>
  )
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity-services]')
    if (existing) {
      existing.addEventListener('load', resolve, {once: true})
      existing.addEventListener('error', reject, {once: true})
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentityServices = 'true'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
