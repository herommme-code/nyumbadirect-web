import React from 'react'
import greenLogo from '../assets/greenlogo.svg'
import creamLogo from '../assets/creamlogo.svg'

export function BrandLogoMark({size = 44, light = false}) {
  return (
    <img
      className="brand-logo-mark"
      src={light ? creamLogo : greenLogo}
      alt="Nyumbadirect"
      style={{width: size, height: size}}
    />
  )
}

export function BrandWordmark({light = false, fontSize = 22}) {
  return (
    <span
      className={`brand-wordmark ${light ? 'brand-wordmark-light' : ''}`}
      style={{fontSize}}
    >
      <span className="brand-wordmark-heavy">Nyumba</span><span className="brand-wordmark-semibold">Direct</span>
    </span>
  )
}

export function BrandLockup({light = false}) {
  return (
    <div className="brand-lockup">
      <BrandLogoMark size={42} light={light} />
      <BrandWordmark light={light} />
    </div>
  )
}

export default BrandLogoMark
