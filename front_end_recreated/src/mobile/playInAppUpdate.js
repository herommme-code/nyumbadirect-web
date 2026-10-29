import {Capacitor, registerPlugin} from '@capacitor/core'

const PlayInAppUpdate = registerPlugin('PlayInAppUpdate')

export async function promptForPlayUpdate() {
  if (!Capacitor.isNativePlatform()) return {available: false}
  try {
    const {available} = await PlayInAppUpdate.checkForUpdate()
    if (available) await PlayInAppUpdate.startFlexibleUpdate()
    return {available}
  } catch (error) {
    // Development, sideloaded, and non-Play builds do not expose an update.
    console.info('Google Play update check skipped:', error)
    return {available: false}
  }
}

export async function installDownloadedPlayUpdate() {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const {downloaded} = await PlayInAppUpdate.getInstallStatus()
    if (!downloaded) return false
    await PlayInAppUpdate.completeFlexibleUpdate()
    return true
  } catch {
    return false
  }
}
