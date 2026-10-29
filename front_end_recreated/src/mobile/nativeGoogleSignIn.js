import {Capacitor, registerPlugin} from '@capacitor/core'

const NativeGoogleSignIn = registerPlugin('NativeGoogleSignIn')

export function usesNativeGoogleSignIn() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export async function signInWithNativeGoogle() {
  if (!usesNativeGoogleSignIn()) throw new Error('Native Google sign-in is not available in this browser.')
  return NativeGoogleSignIn.signIn()
}
