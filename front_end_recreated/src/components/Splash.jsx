import React, {useEffect} from 'react'
import {BrandLogoMark, BrandWordmark} from './BrandLogo'

export default function Splash({onDone}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <main className="splash-screen">
      <div className="splash-lockup">
        <BrandLogoMark size={112} />
        <BrandWordmark fontSize={34} />
      </div>
    </main>
  )
}
