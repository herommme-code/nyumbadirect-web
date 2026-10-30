import React, {useEffect} from 'react'
import {BrandLogoMark} from './BrandLogo'

export default function Splash({onDone}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <main className="splash-screen splash-screen-native">
      <div className="splash-lockup">
        <BrandLogoMark size={156} light />
      </div>
    </main>
  )
}
