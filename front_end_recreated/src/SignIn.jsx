import { useState } from 'react'
import FormField from './components/FormField'
import {BrandLogoMark} from './components/BrandLogo'
import Icon from './components/Icon'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setLoading(false)
  }

  return (
    <main className="auth-landing">
      <section className="auth-showcase">
        <div className="auth-facebook-structure">
          <BrandLogoMark size={74} />
          <div className="auth-social-collage" aria-hidden="true">
            <div className="auth-tower tower-left">
              <span /><span /><span />
            </div>
            <div className="auth-tower tower-main">
              <span /><span /><span />
            </div>
            <div className="auth-tower tower-right">
              <span /><span /><span />
            </div>
            <div className="auth-home-emblem">
              <Icon name="home_rounded" />
            </div>
            <div className="auth-creative-note note-location">
              <Icon name="location_on_outlined" />
              GPS-verified locations
            </div>
            <div className="auth-creative-note note-broker">
              <Icon name="support_agent" style={{fontSize:'20px'}} />
              Direct broker chat
            </div>
            <span className="auth-arc arc-one" />
            <span className="auth-arc arc-two" />
            <span className="auth-arc arc-three" />
          </div>
          <div className="auth-showcase-copy">
            <h1>Explore<br />homes<br /><span>you love.</span></h1>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <h2>Log into Nyumbadirect</h2>
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

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
          <button className="auth-forgot" type="button">
            Forgot password?
          </button>

          <div className="auth-google-native" aria-label="Sign in with Google" />

          <button className="auth-switch" type="button">
            Create new account
          </button>
          <div className="auth-meta-lockup">
            <BrandLogoMark size={28} />
            <span>Nyumbadirect</span>
          </div>
        </form>
      </section>
    </main>
  )
}