import React, {useEffect, useMemo, useRef, useState} from 'react'
import {BrandLockup, BrandLogoMark} from './BrandLogo'
import Icon from './Icon'
import {
  deleteChatConversation,
  deleteChatMessage,
  deleteSellerListing,
  fetchFavorites,
  fetchChatConversations,
  fetchChatUsers,
  fetchProfile,
  fetchPublicListings,
  fetchSellerListings,
  fetchSyncEvents,
  markChatConversationRead,
  removeProfilePhoto,
  recordPropertyView,
  sendChatMessage,
  saveSellerListing,
  syncFavorites,
  syncStreamUrl,
  updateProfile,
  uploadPropertyImages,
  uploadProfilePhoto,
} from '../api/nyumbaApi'
import findImg from '../assets/onboarding/find-rentals.jpg'
import verifiedImg from '../assets/onboarding/verified-locations.jpg'
import connectImg from '../assets/onboarding/connect-brokers.jpg'
import manageImg from '../assets/onboarding/manage-properties.jpg'
import instagramIcon from '../assets/icons/instagram.svg'
import tiktokIcon from '../assets/icons/tiktok.svg'

const privacyPolicyUrl = 'https://nyumbadirectonline.co.tz/privacy-policy'
const supportEmail = 'nyumbadirect@gmail.com'
const instagramUrl = 'https://www.instagram.com/nyumbadirecttz'
const tiktokUrl = 'https://www.tiktok.com/@nyumbadirecttz'

const listings = [
  {
    id: 'masaki-01',
    title: 'Modern Apartment in Masaki',
    description: 'Bright two bedroom apartment near restaurants, shops, and reliable transport routes.',
    price: 1500000,
    purpose: 'Rent',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Masaki',
    landmark: 'Near Slipway',
    latitude: -6.747,
    longitude: 39.278,
    amenities: ['Security', 'Parking', 'Water', 'Balcony'],
    isVerified: true,
    isFeatured: true,
    image: findImg,
    posted: '2 days ago',
    views: 128,
  },
  {
    id: 'mikocheni-02',
    title: 'Family House in Mikocheni',
    description: 'A calm family home with garden space, fenced compound, and easy access to main roads.',
    price: 2200000,
    purpose: 'Rent',
    type: 'House',
    bedrooms: 3,
    bathrooms: 3,
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mikocheni',
    landmark: 'Regent Estate',
    latitude: -6.763,
    longitude: 39.241,
    amenities: ['Fence', 'Garden', 'Parking', 'Security'],
    isVerified: true,
    isFeatured: true,
    image: verifiedImg,
    posted: '4 days ago',
    views: 96,
  },
  {
    id: 'sinza-03',
    title: 'Affordable Rooms in Sinza',
    description: 'Clean rooms for students and young professionals with water, electricity, and nearby shops.',
    price: 280000,
    purpose: 'Rent',
    type: 'Rooms',
    bedrooms: 1,
    bathrooms: 1,
    region: 'Dar es Salaam',
    district: 'Ubungo',
    ward: 'Sinza',
    landmark: 'Sinza Mori',
    latitude: -6.789,
    longitude: 39.216,
    amenities: ['Water', 'Electricity', 'Tiles'],
    isVerified: true,
    isFeatured: false,
    image: connectImg,
    posted: '1 week ago',
    views: 72,
  },
  {
    id: 'kigamboni-04',
    title: 'Beachside Plot in Kigamboni',
    description: 'Surveyed plot suitable for a residential project, close to the ocean and ferry routes.',
    price: 68000000,
    purpose: 'Sale',
    type: 'Plot',
    plotSize: '1.2',
    plotSizeUnit: 'Acres',
    bedrooms: 0,
    bathrooms: 0,
    region: 'Dar es Salaam',
    district: 'Kigamboni',
    ward: 'Kibada',
    landmark: 'Kibada Road',
    latitude: -6.894,
    longitude: 39.347,
    amenities: ['GPS Verified', 'Fence'],
    isVerified: true,
    isFeatured: true,
    image: manageImg,
    posted: 'Today',
    views: 143,
  },
]

const demoListingIds = new Set(listings.map((listing) => listing.id))

const destinations = [
  {label: 'Home', icon: 'home_rounded'},
  {label: 'Search', icon: 'search_rounded'},
  {label: 'Map', icon: 'map_rounded'},
  {label: 'Saved', icon: 'favorite_rounded'},
  {label: 'Chat', icon: 'chat_bubble_rounded'},
  {label: 'Seller', icon: 'storefront_rounded'},
  {label: 'Profile', icon: 'person_rounded'},
]

const popularAreas = ['Mikocheni', 'Masaki', 'Sinza', 'Kijitonyama', 'Oysterbay', 'Tabata']
const listingPurposeOptions = ['Rent', 'Sale']
const rentalPropertyTypes = ['Rooms', 'Apartment', 'House']
const salePropertyTypes = ['House', 'Plot']
const plotSizeUnitOptions = ['Acres', 'Sq meters']
const propertyAmenityOptions = [
  'Fence',
  'Parking',
  'Security',
  'Water',
  'Electricity',
  'Furnished',
  'Air Conditioning',
  'Balcony',
  'Kitchen',
  'Tiles',
  'Garden',
  'CCTV',
  'Swimming Pool',
  'Backup Generator',
  'GPS Verified',
]
const propertyRegionDistricts = {
  'Arusha': ['Arusha City', 'Arusha', 'Karatu', 'Longido', 'Meru', 'Monduli', 'Ngorongoro'],
  'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'],
  'Dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma City', 'Kondoa', 'Kongwa', 'Mpwapwa'],
  'Geita': ['Bukombe', 'Chato', 'Geita', 'Mbogwe', 'Nyanghwale'],
  'Iringa': ['Iringa', 'Iringa Municipal', 'Kilolo', 'Mafinga', 'Mufindi'],
  'Kilimanjaro': ['Hai', 'Moshi', 'Moshi Municipal', 'Mwanga', 'Rombo', 'Same', 'Siha'],
  'Mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Nyamagana', 'Sengerema', 'Ukerewe'],
  'Pwani': ['Bagamoyo', 'Kibaha', 'Kibaha Town', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji'],
  'Tanga': ['Handeni', 'Handeni Town', 'Kilindi', 'Korogwe', 'Korogwe Town', 'Lushoto', 'Muheza', 'Mkinga', 'Pangani', 'Tanga City'],
  'Zanzibar Urban West': ['Magharibi A', 'Magharibi B', 'Mjini'],
}
const defaultPropertyRegion = 'Dar es Salaam'
const defaultPropertyDistrict = 'Kinondoni'
const defaultProfile = {
  fullName: 'Nyumbadirect Guest',
  phone: '',
  whatsappNumber: '',
  location: 'Tanzania',
  bio: 'Looking for verified rental homes.',
  profilePhotoUrl: '',
}

function accountKey(email, suffix) {
  return `nyumba_${suffix}_${email.trim().toLowerCase()}`
}

function loadStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback
  } catch {
    return fallback
  }
}

function saveStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function withoutDemoListings(items = []) {
  return items.filter((listing) => !demoListingIds.has(`${listing?.id || ''}`))
}

function money(value) {
  return `TZS ${value.toLocaleString('en-US')}`
}

function listingPriceLabel(listing) {
  return listing.purpose === 'Sale' ? money(listing.price) : `${money(listing.price)} / month`
}

function mapMarkerLabel(listing) {
  return listing.price > 0 ? money(listing.price) : 'Property location'
}

function initialChatConversations() {
  // Conversations belong to Laravel. Do not create React-only sample chats.
  return []
}

function unreadConversationIds(conversations, locallyReadIds = new Set()) {
  return new Set(conversations
    .filter((conversation) => !locallyReadIds.has(conversation.id) && (conversation.isUnread || conversation.unreadCount > 0))
    .map((conversation) => conversation.id))
}

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_FALLBACK_URL = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
const TANZANIA_CENTER = {latitude: -6.369, longitude: 34.8888}
const TILE_SIZE = 256

function tileUrl(template, z, x, y) {
  return template.replace('{z}', z).replace('{x}', x).replace('{y}', y)
}

function latLngToWorldPixel(latitude, longitude, zoom) {
  const sinLatitude = Math.sin((latitude * Math.PI) / 180)
  const scale = TILE_SIZE * 2 ** zoom
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  }
}

function centerForListings(items) {
  if (!items.length) return TANZANIA_CENTER
  return {
    latitude: items.reduce((sum, listing) => sum + listing.latitude, 0) / items.length,
    longitude: items.reduce((sum, listing) => sum + listing.longitude, 0) / items.length,
  }
}

function hasMapLocation(listing) {
  return Number.isFinite(listing.latitude) &&
    Number.isFinite(listing.longitude) &&
    listing.latitude !== 0 &&
    listing.longitude !== 0
}

function propertyGalleryImages(listing) {
  const sources = [
    listing.image,
    listing.imageUrl,
    ...(listing.imageUrls || []),
    ...(listing.localImagePaths || []),
    ...(listing.images || []),
    ...(listing.photos || []),
    ...(listing.gallery || []),
  ]
  const images = sources
    .map((source) => typeof source === 'string'
      ? source
      : source?.url || source?.image_url || source?.imageUrl || source?.path || source?.src || '')
    .map((source) => `${source}`.trim())
    .filter(Boolean)
  const uniqueImages = [...new Set(images)]
  return uniqueImages.length ? uniqueImages : [findImg]
}

function primaryListingImage(listing) {
  return propertyGalleryImages(listing)[0] || findImg
}

function mergeUploadedPropertyListing(baseListing, uploadedListing) {
  const uploadedImages = propertyGalleryImages(uploadedListing).filter((image) => !image.startsWith('blob:') && !image.startsWith('data:'))
  const baseImages = propertyGalleryImages(baseListing)
  const mergedImages = [
    ...uploadedImages,
    ...baseImages.filter((image) => !uploadedImages.includes(image)),
  ]
  const finalImages = mergedImages.length ? mergedImages : baseImages
  return {
    ...baseListing,
    ...uploadedListing,
    id: uploadedListing.id || baseListing.id,
    image: finalImages[0] || uploadedListing.image || baseListing.image,
    imageUrl: finalImages[0] || uploadedListing.imageUrl || baseListing.imageUrl,
    imageUrls: finalImages,
    localImagePaths: finalImages,
    views: uploadedListing.views > 0 ? uploadedListing.views : baseListing.views,
    seller: uploadedListing.seller || baseListing.seller,
  }
}

function listingIdentityKey(listing) {
  const id = `${listing?.id || ''}`.trim()
  if (id) return `id:${id}`
  return [
    listing?.title,
    listing?.ward,
    listing?.district,
    listing?.purpose,
  ].map((item) => `${item || ''}`.trim().toLowerCase()).join('|')
}

function sameListing(left, right) {
  const leftId = `${left?.id || ''}`.trim()
  const rightId = `${right?.id || ''}`.trim()
  if (leftId && rightId && leftId === rightId) return true
  return `${left?.title || ''}`.trim().toLowerCase() === `${right?.title || ''}`.trim().toLowerCase() &&
    `${left?.ward || ''}`.trim().toLowerCase() === `${right?.ward || ''}`.trim().toLowerCase() &&
    `${left?.district || ''}`.trim().toLowerCase() === `${right?.district || ''}`.trim().toLowerCase()
}

function mergeListingCollections(baseListings = [], incomingListings = []) {
  const merged = [...baseListings]
  incomingListings.forEach((incoming) => {
    const index = merged.findIndex((existing) => sameListing(existing, incoming))
    if (index >= 0) {
      merged[index] = mergeUploadedPropertyListing(merged[index], incoming)
    } else {
      merged.unshift(incoming)
    }
  })
  const seen = new Set()
  return merged.filter((listing) => {
    const key = listingIdentityKey(listing)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function zoomForListings(items, detailed = false) {
  if (!items.length) return 6
  if (detailed || items.length <= 1) return 13
  const latitudes = items.map((listing) => listing.latitude)
  const longitudes = items.map((listing) => listing.longitude)
  const span = Math.max(
    Math.max(...latitudes) - Math.min(...latitudes),
    Math.max(...longitudes) - Math.min(...longitudes),
  )
  if (span < 0.04) return 13
  if (span < 0.12) return 12
  if (span < 0.35) return 11
  return 6
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function nonNegativeInteger(value) {
  const parsed = Number.parseInt(`${value || ''}`.replaceAll(',', ''), 10)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function nonNegativeNumber(value) {
  const parsed = Number.parseFloat(`${value || ''}`.replaceAll(',', ''))
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function touchDistance(touches) {
  if (touches.length < 2) return 0
  const [first, second] = touches
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
}

function propertyShareUrl(id) {
  const baseUrl = window.location.href.split('#')[0]
  return `${baseUrl}#/properties/${encodeURIComponent(id)}`
}

function sharedPropertyIdFromHash() {
  const match = window.location.hash.match(/^#\/properties\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function OpenStreetMapLayer({listings, activeListing, onMarkerClick, detailed = false}) {
  const mappedListings = listings.filter(hasMapLocation)
  const focusedListings = activeListing && hasMapLocation(activeListing) ? [activeListing] : mappedListings
  const baseZoom = zoomForListings(focusedListings, detailed)
  const [zoomDelta, setZoomDelta] = useState(0)
  const [panOffset, setPanOffset] = useState({x: 0, y: 0})
  const [isPanning, setIsPanning] = useState(false)
  const [viewport, setViewport] = useState({width: 0, height: 0})
  const mapRef = useRef(null)
  const pinchRef = useRef(null)
  const panRef = useRef(null)

  useEffect(() => {
    const element = mapRef.current
    if (!element) return undefined

    const updateViewport = () => {
      setViewport({width: element.clientWidth, height: element.clientHeight})
    }

    updateViewport()
    const observer = new ResizeObserver(updateViewport)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const center = centerForListings(focusedListings)
  const zoom = clamp(baseZoom + zoomDelta, 5, 18)
  const centerPixel = latLngToWorldPixel(center.latitude, center.longitude, zoom)
  const centerTileX = Math.floor(centerPixel.x / TILE_SIZE)
  const centerTileY = Math.floor(centerPixel.y / TILE_SIZE)
  const tileOffsetX = centerTileX * TILE_SIZE - centerPixel.x
  const tileOffsetY = centerTileY * TILE_SIZE - centerPixel.y
  // Cover the complete map viewport instead of a fixed 5 x 5 tile area.
  // The extra tile also prevents blank edges while a user is dragging.
  const horizontalRadius = Math.ceil(
    ((viewport.width || TILE_SIZE * 5) / 2 + Math.abs(panOffset.x)) / TILE_SIZE,
  ) + 1
  const verticalRadius = Math.ceil(
    ((viewport.height || TILE_SIZE * 5) / 2 + Math.abs(panOffset.y)) / TILE_SIZE,
  ) + 1
  const horizontalTiles = Array.from(
    {length: horizontalRadius * 2 + 1},
    (_, index) => index - horizontalRadius,
  )
  const verticalTiles = Array.from(
    {length: verticalRadius * 2 + 1},
    (_, index) => index - verticalRadius,
  )
  const markerListings = mappedListings
  const zoomIn = () => setZoomDelta((value) => clamp(value + 1, 5 - baseZoom, 18 - baseZoom))
  const zoomOut = () => setZoomDelta((value) => clamp(value - 1, 5 - baseZoom, 18 - baseZoom))
  const handleWheel = (event) => {
    if (!detailed) return
    event.preventDefault()
    const direction = event.deltaY < 0 ? 1 : -1
    setZoomDelta((value) => clamp(value + direction, 5 - baseZoom, 18 - baseZoom))
  }
  const handleMouseDown = (event) => {
    if (event.button !== 1) return
    event.preventDefault()
    setIsPanning(true)
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: panOffset.x,
      originY: panOffset.y,
    }
  }
  const handleMouseMove = (event) => {
    if (!panRef.current) return
    event.preventDefault()
    setPanOffset({
      x: panRef.current.originX + event.clientX - panRef.current.startX,
      y: panRef.current.originY + event.clientY - panRef.current.startY,
    })
  }
  const stopPanning = () => {
    panRef.current = null
    setIsPanning(false)
  }
  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: touchDistance(event.touches),
        zoomDelta,
      }
      panRef.current = null
      setIsPanning(false)
      return
    }
    if (event.touches.length === 1) {
      const [touch] = event.touches
      setIsPanning(true)
      panRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        originX: panOffset.x,
        originY: panOffset.y,
      }
    }
  }
  const handleTouchMove = (event) => {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault()
      const nextDistance = touchDistance(event.touches)
      const scale = nextDistance / Math.max(1, pinchRef.current.distance)
      const zoomChange = Math.round(Math.log2(scale) * 2)
      setZoomDelta(clamp(pinchRef.current.zoomDelta + zoomChange, 5 - baseZoom, 18 - baseZoom))
      return
    }
    if (event.touches.length === 1 && panRef.current) {
      event.preventDefault()
      const [touch] = event.touches
      setPanOffset({
        x: panRef.current.originX + touch.clientX - panRef.current.startX,
        y: panRef.current.originY + touch.clientY - panRef.current.startY,
      })
    }
  }
  const handleTouchEnd = () => {
    pinchRef.current = null
    panRef.current = null
    setIsPanning(false)
  }

  return (
    <div
      ref={mapRef}
      className={isPanning ? 'osm-layer panning' : 'osm-layer'}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopPanning}
      onMouseLeave={stopPanning}
      onWheel={detailed ? handleWheel : undefined}
      onAuxClick={(event) => event.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {horizontalTiles.flatMap((dx) => verticalTiles.map((dy) => {
        const x = centerTileX + dx
        const y = centerTileY + dy
        const key = `${zoom}-${x}-${y}`
        return (
          <img
            key={key}
            className="osm-tile"
            src={tileUrl(OSM_TILE_URL, zoom, x, y)}
            alt=""
            style={{
              left: `calc(50% + ${tileOffsetX + dx * TILE_SIZE + panOffset.x}px)`,
              top: `calc(50% + ${tileOffsetY + dy * TILE_SIZE + panOffset.y}px)`,
            }}
            onError={(event) => {
              if (!event.currentTarget.dataset.fallback) {
                event.currentTarget.dataset.fallback = 'true'
                event.currentTarget.src = tileUrl(OSM_FALLBACK_URL, zoom, x, y)
              }
            }}
          />
        )
      }))}
      {markerListings.map((listing) => {
        const pixel = latLngToWorldPixel(listing.latitude, listing.longitude, zoom)
        const left = pixel.x - centerPixel.x
        const top = pixel.y - centerPixel.y
        const active = activeListing?.id === listing.id
        return (
          <button
            key={listing.id}
            className={active ? 'osm-marker active' : 'osm-marker'}
            style={{left: `calc(50% + ${left + panOffset.x}px)`, top: `calc(50% + ${top + panOffset.y}px)`}}
            onClick={() => onMarkerClick?.(listing)}
            aria-label={listing.title}
          >
            <span className="osm-marker-price">{mapMarkerLabel(listing)}</span>
            <Icon name="location_on" />
          </button>
        )
      })}
      <div className="osm-zoom-controls" aria-label="Map zoom controls" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" onClick={zoomOut} aria-label="Zoom out">-</button>
      </div>
      <a
        className="osm-attribution"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  )
}

export default function AppShell({sessionEmail = '', onLogout}) {
  const [selected, setSelected] = useState(0)
  const [sellerListings, setSellerListings] = useState(() => withoutDemoListings(loadStoredJson('nyumba_public_listings', [])))
  const [accountListings, setAccountListings] = useState(() => sessionEmail ? withoutDemoListings(loadStoredJson(accountKey(sessionEmail, 'seller_listings'), [])) : [])
  const [chatConversations, setChatConversations] = useState(initialChatConversations)
  const [unreadChats, setUnreadChats] = useState(new Set())
  const [readConversationIds, setReadConversationIds] = useState(new Set())
  const [dataStatus, setDataStatus] = useState('loading')
  const [dataMessage, setDataMessage] = useState('Loading live listings...')
  const [saved, setSaved] = useState(() => new Set(sessionEmail ? withoutDemoListings(loadStoredJson(accountKey(sessionEmail, 'favorites'), [])).map((id) => `${id}`.trim()).filter(Boolean) : []))
  const [query, setQuery] = useState('')
  const [activeListing, setActiveListing] = useState(() => withoutDemoListings(loadStoredJson('nyumba_public_listings', []))[0] || null)
  const [detailListing, setDetailListing] = useState(null)
  const [sharedPropertyId, setSharedPropertyId] = useState(sharedPropertyIdFromHash)
  const [pendingChatContact, setPendingChatContact] = useState(null)
  const [sellerMode, setSellerMode] = useState(false)
  const [profile, setProfile] = useState(() => sessionEmail ? loadStoredJson(accountKey(sessionEmail, 'profile'), defaultProfile) : defaultProfile)
  const [profilePhoto, setProfilePhoto] = useState(profile.profilePhotoUrl || '')

  useEffect(() => {
    const updateSharedProperty = () => setSharedPropertyId(sharedPropertyIdFromHash())
    window.addEventListener('hashchange', updateSharedProperty)
    return () => window.removeEventListener('hashchange', updateSharedProperty)
  }, [])

  useEffect(() => {
    if (!sharedPropertyId) return
    const sharedListing = sellerListings.find((listing) => `${listing.id}` === sharedPropertyId)
    if (!sharedListing) return
    setActiveListing(sharedListing)
    setDetailListing(sharedListing)
  }, [sharedPropertyId, sellerListings])

  useEffect(() => {
    let active = true
    fetchPublicListings()
      .then((serverListings) => {
        if (!active) return
        const cleanServerListings = withoutDemoListings(serverListings)
        const cachedPublicListings = withoutDemoListings(loadStoredJson('nyumba_public_listings', []))
        if (cleanServerListings.length || cachedPublicListings.length) {
          const mergedListings = mergeListingCollections(cachedPublicListings, cleanServerListings)
          setSellerListings(mergedListings)
          setActiveListing((current) => current && mergedListings.some((listing) => listing.id === current.id) ? current : mergedListings[0])
          setDataStatus('live')
          setDataMessage(`Loaded ${mergedListings.length} live listings`)
          saveStoredJson('nyumba_public_listings', mergedListings)
        } else {
          setDataStatus('fallback')
          setDataMessage('Hosted server returned no active listings.')
        }
      })
      .catch((error) => {
        if (!active) return
        setDataStatus('fallback')
        setDataMessage(`Could not load hosted listings. ${error.message}`)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!sessionEmail) return
    let active = true
    const loadLiveNotifications = async () => {
      try {
        const liveConversations = await fetchChatConversations(sessionEmail)
        if (!active) return
        setConversations(liveConversations)
        setUnreadChats(unreadConversationIds(liveConversations, readConversationIds))
      } catch {
        // Keep the last known chat state if the hosted server is temporarily unreachable.
      }
    }
    loadLiveNotifications()
    const timer = window.setInterval(loadLiveNotifications, 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [sessionEmail, readConversationIds])

  useEffect(() => {
    if (!sessionEmail) return
    let active = true

    const syncAccountFromServer = async () => {
      const storedProfile = loadStoredJson(accountKey(sessionEmail, 'profile'), defaultProfile)
      const storedListings = withoutDemoListings(loadStoredJson(accountKey(sessionEmail, 'seller_listings'), []))
      setProfile(storedProfile)
      setProfilePhoto(storedProfile.profilePhotoUrl || '')
      if (storedListings.length) setAccountListings(storedListings)

      const [profileResult, listingsResult] = await Promise.allSettled([
        fetchProfile(sessionEmail),
        fetchSellerListings(sessionEmail),
      ])

      if (!active) return

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value)
        setProfilePhoto(profileResult.value.profilePhotoUrl || '')
        saveStoredJson(accountKey(sessionEmail, 'profile'), profileResult.value)
      }

      if (listingsResult.status === 'fulfilled') {
        const serverListings = withoutDemoListings(listingsResult.value)
        setAccountListings(serverListings)
        saveStoredJson(accountKey(sessionEmail, 'seller_listings'), serverListings)
      }
    }

    syncAccountFromServer()
    const timer = window.setInterval(syncAccountFromServer, 30000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncAccountFromServer()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [sessionEmail])

  useEffect(() => {
    if (!sessionEmail) return
    let active = true
    const storedFavorites = loadStoredJson(accountKey(sessionEmail, 'favorites'), [])
    if (Array.isArray(storedFavorites)) {
      setSaved(new Set(storedFavorites.map((item) => `${item}`.trim()).filter(Boolean)))
    }
    fetchFavorites(sessionEmail)
      .then((favorites) => {
        if (!active) return
        setSaved(new Set(favorites))
        saveStoredJson(accountKey(sessionEmail, 'favorites'), favorites)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [sessionEmail])

  useEffect(() => {
    if (!sessionEmail) return
    let active = true
    let source = null
    const storageKey = `nyumba_sync_last_event_${sessionEmail.trim().toLowerCase()}`
    const readLastEventId = () => Number(window.localStorage.getItem(storageKey) || 0)
    const saveLastEventId = (id) => {
      const nextId = Number(id || 0)
      if (nextId > 0) window.localStorage.setItem(storageKey, String(nextId))
    }

    const refreshAccountFromServer = async () => {
      const [profileResult, listingsResult] = await Promise.allSettled([
        fetchProfile(sessionEmail),
        fetchSellerListings(sessionEmail),
      ])
      if (!active) return

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value)
        setProfilePhoto(profileResult.value.profilePhotoUrl || '')
        saveStoredJson(accountKey(sessionEmail, 'profile'), profileResult.value)
      }

      if (listingsResult.status === 'fulfilled') {
        const serverListings = withoutDemoListings(listingsResult.value)
        setAccountListings(serverListings)
        saveStoredJson(accountKey(sessionEmail, 'seller_listings'), serverListings)
      }
    }

    const handleSyncEvent = async (rawEvent) => {
      if (!active || !rawEvent) return
      saveLastEventId(rawEvent.id)

      const eventType = `${rawEvent.event_type || rawEvent.eventType || ''}`.trim()
      const targetEmail = `${rawEvent.target_email || rawEvent.targetEmail || ''}`.trim().toLowerCase()
      const eventPayload = rawEvent.payload || {}
      const propertyPayload = eventPayload.property || null
      const eventListingId = `${rawEvent.entity_id || rawEvent.entityId || propertyPayload?.id || eventPayload.listing_id || ''}`.trim()
      const isOwnAccountEvent = !targetEmail || targetEmail === sessionEmail.trim().toLowerCase()
      const isProfileEvent = eventType.startsWith('profile.')
      const isPropertyEvent = eventType.startsWith('property.') || eventType === 'properties.synced'
      const isFavoritesEvent = eventType === 'favorites.synced'

      if (isProfileEvent && isOwnAccountEvent) {
        await refreshAccountFromServer()
        return
      }

      if (isPropertyEvent) {
        await refreshPublicListingsFromServer().catch(() => {})
        await fetchSellerListings(sessionEmail)
          .then((serverListings) => {
            if (!active) return
            const cleanServerListings = withoutDemoListings(serverListings)
            setAccountListings(cleanServerListings)
            saveStoredJson(accountKey(sessionEmail, 'seller_listings'), cleanServerListings)
          })
          .catch(() => {})

        if (eventListingId) {
          setDetailListing((current) => {
            if (!current) return current
            if (`${current.id || ''}`.trim() !== eventListingId) return current
            if (eventType === 'property.deleted' || eventType === 'property.removed') return null
            return propertyPayload && typeof propertyPayload === 'object'
              ? {...current, ...propertyPayload}
              : current
          })
          setActiveListing((current) => {
            if (!current) return current
            if (`${current.id || ''}`.trim() !== eventListingId) return current
            if (eventType === 'property.deleted' || eventType === 'property.removed') return null
            return propertyPayload && typeof propertyPayload === 'object'
              ? {...current, ...propertyPayload}
              : current
          })
      }

      if (isFavoritesEvent && isOwnAccountEvent) {
        const favorites = Array.isArray(eventPayload.favorites) ? eventPayload.favorites.map((item) => `${item}`.trim()).filter(Boolean) : []
        setSaved(new Set(favorites))
        saveStoredJson(accountKey(sessionEmail, 'favorites'), favorites)
      }
    }
    }

    const bootSync = async () => {
      try {
        const events = await fetchSyncEvents({email: sessionEmail, sinceId: readLastEventId()})
        if (!active) return
        for (const event of events) {
          await handleSyncEvent(event)
        }
      } catch {
        // The live stream still keeps us near real-time if the catch-up request fails.
      }

      if (!active || typeof window.EventSource !== 'function') return
      source = new window.EventSource(syncStreamUrl({email: sessionEmail, sinceId: readLastEventId()}))
      source.addEventListener('sync', (event) => {
        if (!active) return
        try {
          const payload = JSON.parse(event.data)
          void handleSyncEvent(payload)
        } catch {
          // Ignore malformed sync payloads and wait for the next one.
        }
      })
    }

    bootSync()

    return () => {
      active = false
      if (source) source.close()
    }
  }, [sessionEmail])

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return sellerListings
    return sellerListings.filter((listing) => [
      listing.title,
      listing.type,
      listing.region,
      listing.district,
      listing.ward,
      listing.landmark,
      listing.purpose,
      ...listing.amenities,
    ].join(' ').toLowerCase().includes(search))
  }, [query, sellerListings])

  function toggleSaved(id) {
    setSaved((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      if (sessionEmail) {
        const savedIds = [...next]
        saveStoredJson(accountKey(sessionEmail, 'favorites'), savedIds)
        void syncFavorites({email: sessionEmail, favorites: savedIds}).catch(() => {})
      }
      return next
    })
  }

  function openListingDetails(listing) {
    setActiveListing(listing)
    setDetailListing(listing)
    window.history.replaceState(null, '', propertyShareUrl(listing.id))
    setSharedPropertyId(`${listing.id}`)
  }

  function closeListingDetails() {
    setDetailListing(null)
    if (sharedPropertyId) {
      window.history.replaceState(null, '', window.location.href.split('#')[0])
      setSharedPropertyId('')
    }
  }

  function handlePropertyViewed(updatedListing) {
    if (!updatedListing?.id) return
    setDetailListing((current) => current && current.id === updatedListing.id ? {...current, ...updatedListing} : current)
    setActiveListing((current) => current && current.id === updatedListing.id ? {...current, ...updatedListing} : current)
    setSellerListings((current) => mergeListingCollections(current, [updatedListing]))
    setAccountListings((current) => mergeListingCollections(current, [updatedListing]))
  }

  function openMapForListing(listing) {
    if (listing) setActiveListing(listing)
    setDetailListing(null)
    setSelected(2)
  }

  const handleSellerModeChanged = (value) => {
    setSellerMode(value)
    setSelected(0)
  }

  function syncSellerWorkspace(nextListings) {
    if (!Array.isArray(nextListings)) return
    const cleanListings = withoutDemoListings(nextListings)
    setAccountListings(cleanListings)
    if (sessionEmail) saveStoredJson(accountKey(sessionEmail, 'seller_listings'), cleanListings)
  }

  function updatePublicListing(listing) {
    if (!listing || !hasMapLocation(listing)) return
    setSellerListings((current) => {
      const next = mergeListingCollections(current, [listing])
      saveStoredJson('nyumba_public_listings', next)
      return next
    })
    setActiveListing((current) => current && sameListing(current, listing) ? listing : current || listing)
    setDataStatus('live')
    setDataMessage('Your GPS-verified property is now visible publicly.')
  }

  async function refreshPublicListingsFromServer() {
    const serverListings = withoutDemoListings(await fetchPublicListings())
    if (serverListings.length) {
      const nextListings = serverListings
      setSellerListings(nextListings)
      setActiveListing((current) => current && nextListings.some((listing) => listing.id === current.id) ? current : nextListings[0])
      setDataStatus('live')
      setDataMessage(`Loaded ${nextListings.length} live listings`)
      saveStoredJson('nyumba_public_listings', nextListings)
    } else {
      setSellerListings([])
      setActiveListing(null)
      setDataStatus('fallback')
      setDataMessage('Hosted server returned no active listings.')
      saveStoredJson('nyumba_public_listings', [])
    }
    return serverListings
  }

  useEffect(() => {
    let active = true

    const syncPublicListings = async () => {
      try {
        const serverListings = withoutDemoListings(await fetchPublicListings())
        if (!active) return
        if (serverListings.length) {
          setSellerListings(serverListings)
          setActiveListing((current) => current && serverListings.some((listing) => listing.id === current.id) ? current : serverListings[0])
          setDataStatus('live')
          setDataMessage(`Loaded ${serverListings.length} live listings`)
          saveStoredJson('nyumba_public_listings', serverListings)
        } else {
          setSellerListings([])
          setActiveListing(null)
          setDataStatus('fallback')
          setDataMessage('Hosted server returned no active listings.')
          saveStoredJson('nyumba_public_listings', [])
        }
      } catch {
        // Keep the last loaded list if the backend is briefly unavailable.
      }
    }

    syncPublicListings()
    const timer = window.setInterval(syncPublicListings, 10000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncPublicListings()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const pages = [
    sellerMode
      ? <SellerScreen listings={accountListings} setListings={setAccountListings} initialView="dashboard" sessionEmail={sessionEmail} profile={profile} openListing={openListingDetails} onListingsSynced={syncSellerWorkspace} onPublicListingUpdate={updatePublicListing} onOpenPropertiesTab={() => setSelected(1)} refreshPublicListings={refreshPublicListingsFromServer} />
      : <HomeScreen listings={sellerListings} setSelected={setSelected} setQuery={setQuery} saved={saved} toggleSaved={toggleSaved} openListing={openListingDetails} dataStatus={dataStatus} dataMessage={dataMessage} />,
    sellerMode
      ? <SellerScreen listings={accountListings} setListings={setAccountListings} initialView="properties" sessionEmail={sessionEmail} profile={profile} openListing={openListingDetails} onListingsSynced={syncSellerWorkspace} onPublicListingUpdate={updatePublicListing} refreshPublicListings={refreshPublicListingsFromServer} />
      : <SearchScreen query={query} setQuery={setQuery} listings={filteredListings} saved={saved} toggleSaved={toggleSaved} openListing={openListingDetails} openMap={() => openMapForListing(filteredListings.find(hasMapLocation) || sellerListings.find(hasMapLocation))} dataStatus={dataStatus} dataMessage={dataMessage} />,
    <MapScreen listings={sellerListings} setSelected={setSelected} activeListing={activeListing} setActiveListing={setActiveListing} />,
    <SavedScreen listings={sellerListings.filter((listing) => saved.has(listing.id))} saved={saved} toggleSaved={toggleSaved} openListing={openListingDetails} />,
    <ChatScreen
      listings={sellerListings}
      sessionEmail={sessionEmail}
      conversations={chatConversations}
      setConversations={setChatConversations}
      unreadChats={unreadChats}
      setUnreadChats={setUnreadChats}
      readConversationIds={readConversationIds}
      setReadConversationIds={setReadConversationIds}
      initialContact={pendingChatContact}
      onInitialContactHandled={() => setPendingChatContact(null)}
      onBack={() => setSelected(6)}
    />,
    <SellerScreen listings={accountListings} setListings={setAccountListings} sessionEmail={sessionEmail} profile={profile} openListing={openListingDetails} onListingsSynced={syncSellerWorkspace} onPublicListingUpdate={updatePublicListing} onOpenPropertiesTab={() => setSelected(1)} refreshPublicListings={refreshPublicListingsFromServer} />,
    <ProfileScreen
      sellerMode={sellerMode}
      setSellerMode={handleSellerModeChanged}
      sessionEmail={sessionEmail}
      profile={profile}
      setProfile={setProfile}
      profilePhoto={profilePhoto}
      setProfilePhoto={setProfilePhoto}
      unreadMessageCount={unreadChats.size}
      onMessagesPressed={() => setSelected(4)}
      onLogout={onLogout}
    />,
  ]

  const mobileTabs = [0, 1, 2, 3, 6]
  const mobileIndex = mobileTabs.includes(selected) ? mobileTabs.indexOf(selected) : 4

  const shellClassName = selected === 2 ? 'shell showing-map' : selected === 4 ? 'shell showing-chat' : 'shell'

  return (
    <div className={shellClassName}>
      <aside className="rail">
        <div className="rail-brand"><BrandLockup /></div>
        {destinations.map((destination, index) => {
          if (destination.label === 'Chat' || destination.label === 'Seller') return null
          return (
            <button
              key={destination.label}
              className={selected === index ? 'rail-item active' : 'rail-item'}
              onClick={() => setSelected(index)}
            >
              <Icon name={destination.icon} />
              <span>{sellerMode && index === 0 ? 'Dashboard' : sellerMode && index === 1 ? 'Properties' : destination.label}</span>
              {index === 6 && unreadChats.size > 0 && <b className="nav-unread-badge">{unreadChats.size > 9 ? '9+' : unreadChats.size}</b>}
            </button>
          )
        })}
      </aside>

      <main className="shell-content">
        {detailListing ? (
          <PropertyDetails
            listing={detailListing}
            sessionEmail={sessionEmail}
            saved={saved.has(detailListing.id)}
            toggleSaved={() => toggleSaved(detailListing.id)}
            onBack={closeListingDetails}
            onChat={() => {
              const seller = detailListing.seller || {}
              setPendingChatContact(seller.email ? {
                id: seller.email,
                title: seller.name || 'Property seller',
                email: seller.email,
                subtitle: [seller.location, seller.bio].filter(Boolean).join(' - '),
                status: seller.isOnline ? 'Online now' : 'Offline',
                image: seller.profilePhotoUrl || seller.profile_photo_url || '',
                phone: seller.phone || '',
                whatsappNumber: seller.whatsappNumber || seller.whatsapp_number || '',
              } : null)
              setDetailListing(null)
              setSelected(4)
            }}
            onViewMap={() => openMapForListing(detailListing)}
            onViewTracked={handlePropertyViewed}
          />
        ) : pages[selected]}
      </main>

      {!detailListing && selected !== 2 && selected !== 4 && (
        <nav className="bottom-nav">
          {mobileTabs.map((tab, index) => {
            const destination = destinations[tab]
            const label = sellerMode && tab === 0 ? 'Dashboard' : sellerMode && tab === 1 ? 'Properties' : destination.label
            return (
              <button
                key={destination.label}
                className={mobileIndex === index ? 'bottom-item active' : 'bottom-item'}
                onClick={() => setSelected(tab)}
              >
                <Icon name={destination.icon} />
                <span>{tab === 6 ? 'Profile' : label}</span>
                {tab === 6 && unreadChats.size > 0 && <b className="nav-unread-badge">{unreadChats.size > 9 ? '9+' : unreadChats.size}</b>}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

function AppPage({children}) {
  return <div className="app-page">{children}</div>
}

function HomeScreen({listings, setSelected, setQuery, saved, toggleSaved, openListing, dataStatus, dataMessage}) {
  const featured = (listings.some((listing) => listing.isFeatured)
    ? listings.filter((listing) => listing.isFeatured)
    : listings).slice(0, 5)
  return (
    <AppPage>
      <HeroSection onSearch={() => setSelected(1)} />
      <DataStatusBanner status={dataStatus} message={dataMessage} />
      <div className="stat-row">
        <StatPill icon="verified" label="GPS verified" value="Real mapped locations" />
        <StatPill icon="location_city" label="Rental listings" value="Homes ready to explore" />
        <StatPill icon="support_agent" label="Active brokers" value="Direct help from trusted brokers" />
      </div>
      <SectionHeader title="Featured Rentals" action="See all" onAction={() => setSelected(1)} />
      <div className="property-grid home-feature-grid">
        {featured.map((listing) => (
          <PropertyCard
            key={listing.id}
            listing={listing}
            saved={saved.has(listing.id)}
            toggleSaved={() => toggleSaved(listing.id)}
            openListing={() => openListing(listing)}
          />
        ))}
        <button className="more-properties-card" type="button" onClick={() => setSelected(1)}>
          <span className="more-properties-kicker">See more</span>
          <strong>Browse the full property list</strong>
          <p>Explore more verified homes, rentals, and properties across Tanzania.</p>
          <div className="more-properties-cta">
            <Icon name="arrow_forward_rounded" />
            <span>Open search</span>
          </div>
        </button>
      </div>
      <SectionHeader title="Popular Areas" />
      <div className="area-row">
        {popularAreas.map((area) => (
          <button key={area} className="area-chip" onClick={() => { setQuery(area); setSelected(1) }}>
            <Icon name="location_on" />
            <span>{area}</span>
          </button>
        ))}
      </div>
    </AppPage>
  )
}

function HeroSection({onSearch}) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <BrandLockup light />
        <p className="eyebrow">Verified Homes. Real Locations.</p>
        <h1>Find Verified Rental Properties Across Tanzania</h1>
        <p className="hero-text">Smarter Rental Connections</p>
        <SearchBar readOnly placeholder="Search by location, district, or property type" onFocus={onSearch} />
        <div className="hero-actions">
          <button className="hero-primary-action" onClick={onSearch}>
            <Icon name="search_rounded" />
            Browse rentals
          </button>
          <button className="hero-secondary-action" onClick={onSearch}>
            <Icon name="map_rounded" />
            View mapped homes
          </button>
        </div>
      </div>
      <div className="hero-preview">
        <div className="hero-preview-heading">
          <p>Verified Homes. Real Locations.</p>
          <span>GPS ready</span>
        </div>
        <div className="building-illustration" aria-hidden="true">
          <span className="roof" />
          <span className="house" />
        </div>
        <div className="preview-home-card">
          <div>
            <strong>Masaki Apartment</strong>
            <span>2 beds · verified broker</span>
          </div>
          <Icon name="verified" />
        </div>
        <div className="verified-line">
          <Icon name="verified" />
          <span>GPS Verified Location</span>
        </div>
      </div>
    </section>
  )
}

function SearchScreen({query, setQuery, listings, saved, toggleSaved, openListing, openMap, dataStatus, dataMessage}) {
  const resultTitle = query.trim() ? 'Search Results' : 'All Published Properties'
  return (
    <div className="search-page">
      <div className="search-top">
        <SearchPageTitle />
        <SearchBar value={query} onChange={setQuery} />
        <DataStatusBanner status={dataStatus} message={dataMessage} />
        <div className="search-filter-row">
          {['Apartment', 'House', 'Plot', 'Room', 'Nearby'].map((filter) => (
            <button key={filter} className="search-filter-chip" onClick={() => setQuery(filter)}>
              {filter}
            </button>
          ))}
        </div>
      </div>
      <SearchResultsMap listings={listings} onOpenMap={openMap} />
      <div className="search-results">
        <SectionHeader title={resultTitle} action={`${listings.length} found`} />
        {listings.length ? (
          <PropertyGrid listings={listings} saved={saved} toggleSaved={toggleSaved} openListing={openListing} />
        ) : (
          <NoticeCard icon="search_off" title="No Matches" text="Try another location, property type, price, or room count." />
        )}
      </div>
    </div>
  )
}

function SearchPageTitle() {
  return (
    <header className="search-page-title">
      <BrandLockup />
      <h1>Search properties</h1>
      <p>Search by location, district, ward, nearby properties, price, rooms, sale, rent, or property type.</p>
    </header>
  )
}

function SearchResultsMap({listings, onOpenMap}) {
  return (
    <section className="search-results-map" aria-label="Search results map">
      <OpenStreetMapLayer listings={listings} />
      <div className="map-count-chip">
        <Icon name="location_on" />
        <span>{listings.length ? `${listings.length} mapped` : 'No mapped results'}</span>
      </div>
      <button className="map-open-button" type="button" onClick={onOpenMap}>
        <Icon name="map_rounded" />
        <span>View on map</span>
      </button>
    </section>
  )
}

function MapScreen({listings, setSelected, activeListing, setActiveListing}) {
  return (
    <div className="map-screen">
      <OpenStreetMapLayer
        listings={listings}
        activeListing={activeListing}
        onMarkerClick={setActiveListing}
        detailed
      />
      <MapHeaderOverlay onBack={() => setSelected(0)} />
    </div>
  )
}

function MapHeaderOverlay({onBack}) {
  return (
    <header className="map-header-overlay">
      <button className="map-back-button" onClick={onBack} aria-label="Back">
        <Icon name="arrow_back_rounded" />
      </button>
      <BrandLogoMark size={42} />
      <div className="map-header-copy">
        <h1>Property Map</h1>
        <p>Explore verified rentals across available locations.</p>
      </div>
    </header>
  )
}

function SavedScreen({listings, saved, toggleSaved, openListing}) {
  return (
    <AppPage>
      <PageTitle title="Saved Properties" subtitle="Your favorite rentals and sale listings stay ready here." />
      {listings.length ? (
        <PropertyGrid listings={listings} saved={saved} toggleSaved={toggleSaved} openListing={openListing} />
      ) : (
        <NoticeCard icon="favorite" title="No saved properties yet" text="Tap the heart on any property card to keep it here." />
      )}
    </AppPage>
  )
}

function ChatScreen({listings, sessionEmail, conversations, setConversations, unreadChats, setUnreadChats, readConversationIds, setReadConversationIds, initialContact, onInitialContactHandled, onBack}) {
  const [activeConversationId, setActiveConversationId] = useState('')
  const [draftConversation, setDraftConversation] = useState(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [chatUsers, setChatUsers] = useState([])
  const [chatStatus, setChatStatus] = useState({state: 'loading', message: 'Loading live chats...'})
  const [sendingMessage, setSendingMessage] = useState(false)
  const [profileUser, setProfileUser] = useState(null)
  const [viewingProfilePhoto, setViewingProfilePhoto] = useState('')
  const [toast, setToast] = useState('')
  const [confirmRequest, setConfirmRequest] = useState(null)
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || draftConversation
  const directConversations = conversations.filter((conversation) => conversation.kind === 'direct')
  const propertyConversations = conversations.filter((conversation) => conversation.kind === 'property')
  const allConversations = [...directConversations, ...propertyConversations]
  const filteredUsers = chatUsers.filter((user) => [user.title, user.subtitle, user.status, user.email].join(' ').toLowerCase().includes(userSearchQuery.trim().toLowerCase()))

  useEffect(() => {
    let active = true
    const loadLiveChat = async (showLoading = true) => {
      if (!sessionEmail) {
        setChatStatus({state: 'fallback', message: 'Sign in to load real chats.'})
        return
      }
      if (showLoading) setChatStatus({state: 'loading', message: 'Loading live chats...'})
      try {
        const [liveConversations, liveUsers] = await Promise.all([
          fetchChatConversations(sessionEmail),
          fetchChatUsers(sessionEmail),
        ])
        if (!active) return
        setConversations(liveConversations)
        setUnreadChats(unreadConversationIds(liveConversations, readConversationIds))
        setChatUsers(liveUsers)
        setChatStatus({state: 'live', message: `Loaded ${liveConversations.length} conversations and ${liveUsers.length} users`})
      } catch (error) {
        if (!active) return
        setChatStatus({state: 'fallback', message: `Could not load live chats. ${error.message}`})
      }
    }
    loadLiveChat(true)
    const timer = window.setInterval(() => loadLiveChat(false), 20000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [sessionEmail, setConversations, setUnreadChats, readConversationIds])

  const openConversation = (id) => {
    setDraftConversation(null)
    setActiveConversationId(id)
    setReadConversationIds((current) => {
      const next = new Set(current)
      next.add(id)
      return next
    })
    setUnreadChats((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    if (sessionEmail) {
      markChatConversationRead({email: sessionEmail, conversationId: id}).catch(() => {})
    }
  }
  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }
  const deleteConversation = (id) => {
    setConfirmRequest({
      title: 'Delete chat?',
      message: 'This will remove the chat from your inbox only. The other user will still keep it.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          if (sessionEmail) {
            await deleteChatConversation({email: sessionEmail, conversationId: id})
          }
          if (draftConversation?.id === id) setDraftConversation(null)
          setConversations((current) => current.filter((conversation) => conversation.id !== id))
          setUnreadChats((current) => {
            const next = new Set(current)
            next.delete(id)
            return next
          })
          if (activeConversationId === id) setActiveConversationId('')
          showToast('Chat removed from your inbox.')
        } catch {
          showToast('Could not delete this chat.')
        }
      },
    })
  }
  const sendMessage = async () => {
    const text = messageDraft.trim()
    if (!text || !activeConversation || sendingMessage) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setSendingMessage(true)
    let message = {id: `msg-${Date.now()}`, text, fromUser: true, time}
    let serverConversation = null
    try {
      if (sessionEmail) {
        const result = await sendChatMessage({
          email: sessionEmail,
          text,
          listingId: activeConversation.listingId,
          recipientEmail: activeConversation.recipientEmail,
        })
        message = result.message
        serverConversation = result.conversation
      }
    } catch (error) {
      setChatStatus({state: 'fallback', message: `Could not send live message. ${error.message}`})
      setSendingMessage(false)
      return
    }
    if (serverConversation) {
      setDraftConversation(null)
      setConversations((current) => [
        serverConversation,
        ...current.filter((conversation) => conversation.id !== activeConversation.id && conversation.id !== serverConversation.id),
      ])
      setActiveConversationId(serverConversation.id)
    } else {
      setConversations((current) => current.map((conversation) => (
        conversation.id === activeConversation.id
          ? {...conversation, messages: [...conversation.messages, message], meta: time, unreadCount: 0, isUnread: false}
          : conversation
      )))
    }
    setMessageDraft('')
    setSendingMessage(false)
  }
  const deleteMessage = (messageId) => {
    if (!activeConversation) return
    setConfirmRequest({
      title: 'Delete message?',
      message: 'This message will be removed from this chat for you.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          if (sessionEmail) {
            await deleteChatMessage({email: sessionEmail, messageId})
          }
          setConversations((current) => current.map((conversation) => (
            conversation.id === activeConversation.id
              ? {...conversation, messages: conversation.messages.filter((message) => message.id !== messageId)}
              : conversation
          )))
        } catch {
          showToast('Could not delete this message.')
        }
      },
    })
  }
  const startUserChat = (user) => {
    const existing = conversations.find((conversation) => conversation.id === user.id || conversation.recipientEmail === user.email)
    if (existing) {
      setDraftConversation(null)
      openConversation(existing.id)
      return
    }
    const conversation = {
      id: user.id,
      kind: 'direct',
      title: user.title,
      subtitle: user.subtitle,
      status: user.status,
      recipientEmail: user.email,
      image: user.image,
      user,
      meta: '',
      messages: [],
    }
    setDraftConversation(conversation)
    setConversations((current) => [conversation, ...current])
    setReadConversationIds((current) => {
      const next = new Set(current)
      next.add(user.id)
      return next
    })
    setActiveConversationId(user.id)
  }

  useEffect(() => {
    if (!initialContact?.email) return
    startUserChat(initialContact)
    onInitialContactHandled?.()
  }, [initialContact, onInitialContactHandled])

  const closeConversation = () => {
    setDraftConversation(null)
    setActiveConversationId('')
  }

  if (activeConversation) {
    return (
      <AppPage>
        <div className="chat-screen">
          <ChatThreadHeader
            conversation={activeConversation}
            onBack={closeConversation}
            onProfile={() => setProfileUser(activeConversation.user || activeConversation)}
            onPhoto={() => activeConversation.image ? setViewingProfilePhoto(activeConversation.image) : setProfileUser(activeConversation.user || activeConversation)}
          />
          <div className="chat-thread-body">
            {activeConversation.messages.length === 0 ? (
              <EmptyState icon="chat_bubble_outline" title="Start Chatting" message={activeConversation.kind === 'property' ? 'Send a message to ask about this property.' : 'Send a message to begin this conversation.'} />
            ) : (
              <>
                <div className="chat-date-separator">Today</div>
                {activeConversation.messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onDelete={message.fromUser ? () => deleteMessage(message.id) : undefined}
                  />
                ))}
              </>
            )}
          </div>
          <div className="chat-compose">
            <input
              value={messageDraft}
              placeholder="Write a message"
              onChange={(event) => setMessageDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage()
              }}
            />
            <button type="button" aria-label="Send" onClick={sendMessage} disabled={sendingMessage}><Icon name={sendingMessage ? 'hourglass_top' : 'send_rounded'} /></button>
          </div>
        </div>
        {profileUser && <ChatUserProfile user={profileUser} onClose={() => setProfileUser(null)} />}
        {viewingProfilePhoto && (
          <PropertyImageViewer
            images={[viewingProfilePhoto]}
            selectedIndex={0}
            setSelectedIndex={() => {}}
            onClose={() => setViewingProfilePhoto('')}
          />
        )}
        {confirmRequest && (
          <ConfirmDialog
            {...confirmRequest}
            onCancel={() => setConfirmRequest(null)}
            onConfirm={async () => {
              const action = confirmRequest.onConfirm
              setConfirmRequest(null)
              await action?.()
            }}
          />
        )}
        {toast && <Toast message={toast} />}
      </AppPage>
    )
  }

  return (
    <AppPage>
      <BackTitle title="Messages" subtitle="Start conversations with brokers to learn more about properties." onBack={onBack} />
      <DataStatusBanner status={chatStatus.state} message={chatStatus.message} />
      {allConversations.length === 0 ? (
        <EmptyState icon="chat_bubble_outline" title="No Messages" message="Start conversations with brokers to learn more about properties." />
      ) : (
        <div className="chat-list">
          {allConversations.map((conversation) => (
            <ChatPersonTile
              key={conversation.id}
              conversation={conversation}
              hasUnread={unreadChats.has(conversation.id)}
              onOpen={() => openConversation(conversation.id)}
              onProfile={() => setProfileUser(conversation.user || conversation)}
              onPhoto={() => conversation.image ? setViewingProfilePhoto(conversation.image) : setProfileUser(conversation.user || conversation)}
              onDelete={() => deleteConversation(conversation.id)}
            />
          ))}
        </div>
      )}
      <div className="chat-search-header">
        <SectionHeader title="Start a Chat" />
        <div className="chat-search-card">
          <Icon name="search" />
          <input
            value={userSearchQuery}
            placeholder="Search users or brokers"
            onChange={(event) => setUserSearchQuery(event.target.value)}
          />
          {userSearchQuery.trim() && (
            <button type="button" onClick={() => setUserSearchQuery('')} aria-label="Clear search">
              <Icon name="close" />
            </button>
          )}
        </div>
      </div>
      <div className="chat-list">
        {filteredUsers.length === 0 ? (
          <EmptyState icon="search_off" title="No Matches" message="Try searching another name, email, or location." />
        ) : filteredUsers.map((user) => (
          <ChatPersonTile
            key={user.id}
            conversation={{...user, messages: [], meta: 'Chat'}}
            onOpen={() => startUserChat(user)}
            onProfile={() => setProfileUser(user)}
            onPhoto={() => user.image ? setViewingProfilePhoto(user.image) : setProfileUser(user)}
          />
        ))}
      </div>
      {profileUser && <ChatUserProfile user={profileUser} onClose={() => setProfileUser(null)} />}
      {viewingProfilePhoto && (
        <PropertyImageViewer
          images={[viewingProfilePhoto]}
          selectedIndex={0}
          setSelectedIndex={() => {}}
          onClose={() => setViewingProfilePhoto('')}
        />
      )}
      {confirmRequest && (
        <ConfirmDialog
          {...confirmRequest}
          onCancel={() => setConfirmRequest(null)}
          onConfirm={async () => {
            const action = confirmRequest.onConfirm
            setConfirmRequest(null)
            await action?.()
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </AppPage>
  )
}

function SellerScreen({listings, setListings, initialView = 'dashboard', sessionEmail = '', profile = defaultProfile, openListing, onListingsSynced, onPublicListingUpdate, onOpenPropertiesTab, refreshPublicListings}) {
  const [view, setView] = useState(initialView)
  const [editingListing, setEditingListing] = useState(null)
  const [uploadPurpose, setUploadPurpose] = useState('')
  const [uploadReturnView, setUploadReturnView] = useState(initialView)
  const [submissionResult, setSubmissionResult] = useState(null)

  useEffect(() => {
    setView(initialView)
    setEditingListing(null)
    setUploadPurpose('')
    setUploadReturnView(initialView)
    setSubmissionResult(null)
  }, [initialView])

  useEffect(() => {
    if (!sessionEmail || (view !== 'dashboard' && view !== 'properties')) return
    let active = true
    fetchSellerListings(sessionEmail)
      .then((serverListings) => {
        if (!active || !serverListings.length) return
        const cleanServerListings = withoutDemoListings(serverListings)
        if (!cleanServerListings.length) return
        setListings(cleanServerListings)
        onListingsSynced?.(cleanServerListings)
      })
      .catch(() => {
        // Keep the current workspace if the hosted server is temporarily unreachable.
      })
    return () => {
      active = false
    }
  }, [sessionEmail, view, setListings])

  const openUploadFlow = (returnView = view) => {
    setEditingListing(null)
    setUploadPurpose('')
    setUploadReturnView(returnView)
    setSubmissionResult(null)
    setView('add')
  }

  const openEditFlow = (listing, returnView = 'properties') => {
    setEditingListing(listing)
    setUploadPurpose(listing?.purpose || '')
    setUploadReturnView(returnView)
    setSubmissionResult(null)
    setView('form')
  }

  const sellerViews = {
    dashboard: <SellerDashboard listings={listings} setView={setView} onUpload={() => openUploadFlow('dashboard')} onOpenProperties={onOpenPropertiesTab} />,
    properties: <SellerProperties listings={listings} setListings={setListings} setView={setView} onUpload={() => openUploadFlow('properties')} onEdit={openEditFlow} sessionEmail={sessionEmail} openListing={openListing} onListingsSynced={onListingsSynced} refreshPublicListings={refreshPublicListings} />,
    add: <PropertyPurposeSelectionScreen setView={setView} setUploadPurpose={setUploadPurpose} setEditingListing={setEditingListing} returnView={uploadReturnView} />,
    form: <AddPropertyScreen setView={setView} setListings={setListings} initialPurpose={uploadPurpose || 'Rent'} editingListing={editingListing} returnView={uploadReturnView} sessionEmail={sessionEmail} profile={profile} onListingsSynced={onListingsSynced} onPublicListingUpdate={onPublicListingUpdate} refreshPublicListings={refreshPublicListings} onSaved={setSubmissionResult} />,
    success: <PropertyPublishSuccessScreen result={submissionResult} setView={setView} onUpload={() => openUploadFlow('dashboard')} />,
    analytics: <SellerAnalytics listings={listings} setView={setView} />,
    payments: <SellerPaymentHistory setView={setView} />,
    subscription: <SubscriptionScreen setView={setView} />,
  }
  return <AppPage>{sellerViews[view]}</AppPage>
}

function SellerDashboard({listings, setView, onUpload, onOpenProperties}) {
  const activeListings = listings.filter((listing) => listing.isVerified)
  const estimatedViews = listings.reduce((sum, listing) => sum + listing.views, 0)

  return (
    <>
      <PageTitle title="Seller Dashboard" subtitle="Track performance, publish homes, and manage payments." />
      <SellerDashboardHero
        activeListings={activeListings.length}
        estimatedViews={estimatedViews}
      />
      <div className="dashboard-grid">
        <DashboardCard
          icon="apartment"
          label="Active Listings"
          value={activeListings.length}
          accent="forest"
          onClick={() => {
            if (onOpenProperties) {
              onOpenProperties()
            } else {
              setView('properties')
            }
          }}
        />
        <DashboardCard
          icon="analytics"
          label="Property Analytics"
          value={`${compactNumber(estimatedViews)} views`}
          accent="blue"
          onClick={() => setView('analytics')}
        />
        <DashboardCard
          icon="payments"
          label="Payment History"
          value="Coming soon"
          accent="gold"
          onClick={() => setView('payments')}
        />
      </div>
      <SellerDashboardActions
        onUpload={onUpload}
        onSubscription={() => setView('subscription')}
      />
    </>
  )
}

function SellerDashboardHero({activeListings, estimatedViews}) {
  return (
    <section className="seller-dashboard-hero">
      <div className="seller-dashboard-intro">
        <span>Seller workspace</span>
        <h2>Your listings are ready for serious renters.</h2>
        <p>Keep high-performing homes visible, monitor demand, and move quickly when renters engage.</p>
      </div>
      <div className="seller-dashboard-stats">
        <SellerHeroStat label="Active published listings" value={activeListings} />
        <div className="seller-view-stat">
          <Icon name="trending_up_rounded" />
          <div>
            <strong>{compactNumber(estimatedViews)} estimated views</strong>
            <small>Current listing reach</small>
          </div>
        </div>
      </div>
    </section>
  )
}

function SellerHeroStat({label, value}) {
  return (
    <div className="seller-hero-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function SellerDashboardActions({onUpload, onSubscription}) {
  return (
    <section className="seller-dashboard-actions">
      <div className="seller-action-intro">
        <Icon name="dashboard_customize_rounded" />
        <div>
          <h2>Seller tools</h2>
          <p>Publish verified homes and manage your package.</p>
        </div>
      </div>
      <div className="seller-action-buttons">
        <button className="seller-action-button filled" type="button" onClick={onUpload}>
          <Icon name="add_home" />
          Upload Property
        </button>
        <button className="seller-action-button" type="button" onClick={onSubscription}>
          <Icon name="workspace_premium_rounded" />
          Subscription Package
        </button>
      </div>
    </section>
  )
}

function SellerProperties({listings, setListings, setView, onUpload, onEdit, sessionEmail, openListing, onListingsSynced, refreshPublicListings}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [toast, setToast] = useState('')
  const [confirmRequest, setConfirmRequest] = useState(null)
  const [deletingListingId, setDeletingListingId] = useState('')
  const filteredListings = listings.filter((listing) => {
    const matchesFilter = filter === 'active' ? listing.isVerified : filter === 'pending' ? !listing.isVerified : true
    const text = [
      listing.title,
      listing.type,
      listing.ward,
      listing.district,
      listing.region,
      listing.purpose,
    ].join(' ').toLowerCase()
    return matchesFilter && text.includes(search.trim().toLowerCase())
  })
  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }
  const removeListing = (listing) => {
    setConfirmRequest({
      title: 'Remove property?',
      message: `This will remove "${listing.title}" from your published properties.`,
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: async () => {
        try {
          setDeletingListingId(listing.id)
          if (sessionEmail && listing.id) {
            await deleteSellerListing({email: sessionEmail, listingId: listing.id})
          }
          setListings((current) => {
            const next = current.filter((item) => item.id !== listing.id)
            if (sessionEmail) saveStoredJson(accountKey(sessionEmail, 'seller_listings'), next)
            saveStoredJson(
              'nyumba_public_listings',
              withoutDemoListings(loadStoredJson('nyumba_public_listings', [])).filter((item) => item.id !== listing.id),
            )
            onListingsSynced?.(next)
            return next
          })
          await refreshPublicListings?.().catch(() => {})
          showToast('Property removed.')
        } catch (error) {
          showToast(error.message || 'Property was not removed from the hosted server.')
        } finally {
          setDeletingListingId('')
        }
      },
    })
  }
  const editListing = (listing) => {
    onEdit?.(listing, 'properties')
  }

  return (
    <>
      <PageTitle title="My Properties" subtitle="Manage listings you have posted, update details, and track their status." />
      <SearchBar value={search} onChange={setSearch} placeholder="Search your posted properties" />
      <div className="seller-filter-actions">
        <div className="seller-filter-row">
          <button className={filter === 'active' ? 'active' : ''} type="button" onClick={() => setFilter(filter === 'active' ? '' : 'active')}>Active</button>
          <button className={filter === 'pending' ? 'active' : ''} type="button" onClick={() => setFilter(filter === 'pending' ? '' : 'pending')}>Pending Review</button>
        </div>
        <button className="filled-button page-action" onClick={onUpload}><Icon name="add_home" /> Upload Property</button>
      </div>
      <SectionHeader title="Posted Properties" />
      <div className="seller-list">
        {filteredListings.length === 0 ? (
          <EmptyState icon="home_work_outlined" title="No Properties Found" message="Try another title, location, status, or property type." />
        ) : filteredListings.map((listing) => (
          <article className="seller-property-card" key={listing.id}>
            <button className="seller-property-main" type="button" onClick={() => openListing?.(listing)}>
              <img src={listing.image} alt="" />
              <div>
                <div className="seller-property-title-row">
                  <h3>{listing.title}</h3>
                  <LabelChip label={listing.isVerified ? 'Active' : 'Pending'} icon={listing.isVerified ? 'verified' : 'pending_actions_rounded'} />
                </div>
                <p>{listing.ward}, {listing.district}</p>
                <small>{listing.posted}</small>
                <strong>{listingPriceLabel(listing)}</strong>
                <span><Icon name="visibility_rounded" /> {compactNumber(listing.views)} live views</span>
              </div>
            </button>
            <div className="seller-property-actions">
              <button type="button" onClick={() => editListing(listing)}><Icon name="edit_rounded" /> Edit</button>
              <button type="button" onClick={() => openListing?.(listing)}><Icon name="visibility" /> View</button>
              <button type="button" onClick={() => showToast('Promotion options coming soon.')}><Icon name="trending_up_rounded" /> Promote</button>
              <button
                type="button"
                onClick={() => removeListing(listing)}
                disabled={deletingListingId === listing.id}
              >
                {deletingListingId === listing.id ? <Icon name="hourglass_top" /> : <Icon name="delete_outline" />}
                {deletingListingId === listing.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {confirmRequest && (
        <ConfirmDialog
          {...confirmRequest}
          onCancel={() => setConfirmRequest(null)}
          onConfirm={async () => {
            const action = confirmRequest.onConfirm
            setConfirmRequest(null)
            await action?.()
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  )
}

function PropertyPurposeSelectionScreen({setView, setUploadPurpose, setEditingListing, returnView = 'properties'}) {
  const openPropertyForm = (purpose) => {
    setEditingListing(null)
    setUploadPurpose(purpose)
    setView('form')
  }

  return (
    <>
      <BackTitle title="List a Property" subtitle="Choose the type of listing you want to publish." onBack={() => setView(returnView)} />
      <div className="purpose-choice-list">
        <PropertyPurposeChoiceCard
          icon="home_work_outlined"
          title="For Rent"
          subtitle="Publish rooms, apartments, or houses for monthly tenants."
          badge="Monthly income"
          highlights={['Rooms', 'Apartments', 'Houses']}
          onClick={() => openPropertyForm('Rent')}
        />
        <PropertyPurposeChoiceCard
          icon="real_estate_agent"
          title="For Sale"
          subtitle="Market houses and plots to serious property buyers."
          badge="Buyer leads"
          accent="gold"
          highlights={['Houses', 'Plots', 'Land details']}
          onClick={() => openPropertyForm('Sale')}
        />
      </div>
    </>
  )
}

function AddPropertyScreen({setView, setListings, initialPurpose, editingListing, returnView = 'properties', sessionEmail = '', profile = defaultProfile, onListingsSynced, onPublicListingUpdate, refreshPublicListings, onSaved}) {
  const imageInputRef = useRef(null)
  const baseListing = editingListing || {}
  const startingPurpose = listingPurposeOptions.includes(editingListing?.purpose)
    ? editingListing.purpose
    : listingPurposeOptions.includes(initialPurpose)
      ? initialPurpose
      : 'Rent'
  const startingTypeOptions = startingPurpose === 'Sale' ? salePropertyTypes : rentalPropertyTypes
  const startingType = startingTypeOptions.includes(editingListing?.type)
    ? editingListing.type
    : startingPurpose === 'Sale'
      ? salePropertyTypes[0]
      : 'Apartment'
  const startingRegion = propertyRegionDistricts[editingListing?.region] ? editingListing.region : defaultPropertyRegion
  const startingDistrictOptions = propertyRegionDistricts[startingRegion] || propertyRegionDistricts[defaultPropertyRegion]
  const startingDistrict = startingDistrictOptions.includes(editingListing?.district) ? editingListing.district : startingDistrictOptions[0]
  const [form, setForm] = useState(() => ({
    title: editingListing?.title || '',
    description: editingListing?.description || '',
    price: editingListing?.price ?? '',
    purpose: startingPurpose,
    type: startingType,
    bedrooms: editingListing?.bedrooms ?? '',
    bathrooms: editingListing?.bathrooms ?? '',
    plotSize: editingListing?.plotSize || '',
    plotSizeUnit: plotSizeUnitOptions.includes(editingListing?.plotSizeUnit) ? editingListing.plotSizeUnit : 'Acres',
    region: startingRegion,
    district: startingDistrict,
    ward: editingListing?.ward || '',
    landmark: editingListing?.landmark || '',
    amenities: editingListing?.amenities?.join(', ') || '',
  }))
  const existingLocation = editingListing?.isVerified && hasMapLocation(editingListing)
    ? {latitude: editingListing.latitude, longitude: editingListing.longitude, accuracy: null}
    : null
  const [position, setPosition] = useState(existingLocation)
  const [locationLoading, setLocationLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState(() => editingListing ? propertyGalleryImages(editingListing) : [])
  const [selectedImageFiles, setSelectedImageFiles] = useState([])
  const selectedImagesRef = useRef(selectedImages)
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  useEffect(() => {
    selectedImagesRef.current = selectedImages
  }, [selectedImages])
  useEffect(() => () => {
    selectedImagesRef.current
      .filter((image) => image.startsWith('blob:'))
      .forEach((image) => URL.revokeObjectURL(image))
  }, [])
  const selectedTypeOptions = form.purpose === 'Sale' ? salePropertyTypes : rentalPropertyTypes
  const selectedDistrictOptions = propertyRegionDistricts[form.region] || propertyRegionDistricts[defaultPropertyRegion]
  const selectedAmenities = form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
  const isPlot = form.type === 'Plot'
  const update = (key, value) => setForm((current) => ({...current, [key]: value}))
  const updateNonNegative = (key, value) => {
    if (`${value}`.trim() === '') {
      update(key, '')
      return
    }
    update(key, `${nonNegativeNumber(value)}`)
  }
  const updateType = (value) => setForm((current) => ({
    ...current,
    type: value,
    bedrooms: value === 'Plot' ? '' : current.bedrooms,
    bathrooms: value === 'Plot' ? '' : current.bathrooms,
    amenities: value === 'Plot' ? '' : current.amenities,
    plotSize: value === 'Plot' ? current.plotSize : '',
    plotSizeUnit: value === 'Plot' ? current.plotSizeUnit || 'Acres' : current.plotSizeUnit,
  }))
  const updateRegion = (value) => {
    const districts = propertyRegionDistricts[value] || propertyRegionDistricts[defaultPropertyRegion]
    setForm((current) => ({
      ...current,
      region: value,
      district: districts[0],
      ward: '',
    }))
  }
  const toggleAmenity = (amenity) => {
    setForm((current) => {
      const amenities = new Set(current.amenities.split(',').map((item) => item.trim()).filter(Boolean))
      amenities.has(amenity) ? amenities.delete(amenity) : amenities.add(amenity)
      return {...current, amenities: [...amenities].join(', ')}
    })
  }
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not available in this browser.')
      return
    }
    setLocationLoading(true)
    setMessage('Capturing live GPS coordinates...')
    navigator.geolocation.getCurrentPosition(
      (current) => {
        const nextPosition = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          accuracy: current.coords.accuracy,
        }
        setPosition(nextPosition)
        setLocationLoading(false)
        setMessage(`Live GPS location captured. Accuracy +/- ${Math.round(current.coords.accuracy || 0)} m.`)
      },
      () => {
        setLocationLoading(false)
        setMessage('Could not pick coordinates. Please try again.')
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 0},
    )
  }
  const pickImages = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const nextImages = files.map((file) => URL.createObjectURL(file))
    setSelectedImages((current) => [...current, ...nextImages])
    setSelectedImageFiles((current) => [...current, ...files])
    const nextCount = selectedImages.length + nextImages.length
    setMessage(`${nextCount} ${nextCount === 1 ? 'image' : 'images'} selected.`)
    event.target.value = ''
  }
  const publishProperty = async () => {
    if (!sessionEmail) {
      setMessage('Please sign in before adding a property.')
      return
    }
    const required = ['title', 'description', 'price', 'type', 'region', 'district', 'ward', 'landmark']
    const complete = required.every((key) => `${form[key]}`.trim()) &&
      (isPlot ? `${form.plotSize}`.trim() : `${form.bedrooms}`.trim() && `${form.bathrooms}`.trim())
    if (!complete) {
      setMessage('Complete all listing details with valid property information.')
      return
    }
    const hasLocation = Boolean(position)
    const listingAmenities = isPlot
      ? []
      : form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
    const nextListing = {
      ...baseListing,
      id: editingListing?.id || `seller-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      price: nonNegativeInteger(form.price),
      purpose: form.purpose,
      type: form.type,
      bedrooms: isPlot ? 0 : nonNegativeInteger(form.bedrooms),
      bathrooms: isPlot ? 0 : nonNegativeInteger(form.bathrooms),
      plotSize: isPlot ? form.plotSize : '',
      plotSizeUnit: isPlot ? form.plotSizeUnit : '',
      region: form.region,
      district: form.district,
      ward: form.ward,
      landmark: form.landmark,
      latitude: position?.latitude || 0,
      longitude: position?.longitude || 0,
      amenities: isPlot ? [] : (listingAmenities.length ? listingAmenities : (hasLocation ? ['GPS Verified'] : ['Pending Location'])),
      isVerified: hasLocation,
      image: selectedImages[0] || editingListing?.image || manageImg,
      imageUrls: selectedImages.length ? selectedImages : editingListing?.imageUrls,
      localImagePaths: selectedImages.length ? selectedImages : editingListing?.localImagePaths,
      posted: editingListing?.posted || 'Just now',
      views: editingListing?.views || 0,
      seller: {
        ...(editingListing?.seller || {}),
        name: profile.fullName || 'Nyumbadirect User',
        email: sessionEmail,
        phone: profile.phone || '',
        whatsappNumber: profile.whatsappNumber || '',
        location: profile.location || '',
        bio: profile.bio || '',
        profilePhotoUrl: profile.profilePhotoUrl || '',
      },
    }
    let nextListingsSnapshot = []
    nextListingsSnapshot = editingListing
      ? listings.map((item) => item.id === nextListing.id ? nextListing : item)
      : [nextListing, ...listings]

    // Match the Flutter app: save first, expose GPS-verified listings locally,
    // then allow the server and image uploads to finish in the background.
    setListings(nextListingsSnapshot)
    onListingsSynced?.(nextListingsSnapshot)
    saveStoredJson(accountKey(sessionEmail, 'seller_listings'), nextListingsSnapshot)
    if (hasLocation) onPublicListingUpdate?.(nextListing)

    onSaved?.({listing: nextListing, published: hasLocation})
    setView('success')

    void (async () => {
      try {
        // Save one record only. This prevents a stale browser list from
        // replacing properties created or edited in Flutter.
        let syncedListings = await saveSellerListing({email: sessionEmail, listing: nextListing})
        const syncedListing = syncedListings.find((item) => sameListing(item, nextListing)) || nextListing
        let finalListing = syncedListing

        if (selectedImageFiles.length) {
          const uploadedListing = await uploadPropertyImages({email: sessionEmail, listingId: syncedListing.id, files: selectedImageFiles})
          finalListing = mergeUploadedPropertyListing(syncedListing, uploadedListing)
          syncedListings = syncedListings.map((item) => sameListing(item, syncedListing)
            ? mergeUploadedPropertyListing(item, finalListing)
            : item)
        }

        // Re-fetch the Laravel result after image upload; it is the source of truth.
        syncedListings = await fetchSellerListings(sessionEmail)
        setListings(syncedListings)
        onListingsSynced?.(syncedListings)
        saveStoredJson(accountKey(sessionEmail, 'seller_listings'), syncedListings)
        if (finalListing.isVerified) onPublicListingUpdate?.(finalListing)
        await refreshPublicListings?.().catch(() => [])
      } catch (error) {
        // The listing stays saved and publicly visible locally, just as in Flutter.
        console.warn('Property backend sync failed after local publish:', error)
      }
    })()
  }
  const previewListing = position ? {
    ...baseListing,
    title: form.title.trim() || 'Property location',
    price: Number(`${form.price}`.replaceAll(',', '')) || 0,
    latitude: position.latitude,
    longitude: position.longitude,
    isVerified: true,
  } : null

  return (
    <>
      <BackTitle title={editingListing ? 'Edit Property' : 'Add New Property'} subtitle="Create a rental or sale listing with photos and GPS location." onBack={() => setView(returnView)} />
      <NoticeCard icon="my_location" title="Please stand at the property location before registering coordinates." text="Coordinates are captured live by GPS and cannot be entered manually." />
      <form className="property-form seller-upload-form">
        <ControlledField icon="title" label="Property title" value={form.title} onChange={(value) => update('title', value)} placeholder="Modern apartment in Masaki" />
        <ControlledField icon="payments" label={form.purpose === 'Sale' ? 'Sale price' : 'Price per month'} value={form.price} onChange={(value) => updateNonNegative('price', value)} placeholder="1500000" type="number" />
        <ControlledSelect icon="apartment" label="Property type" value={form.type} options={selectedTypeOptions} onChange={updateType} />
        {!isPlot ? (
          <>
            <ControlledField icon="bed" label="Bedrooms" value={form.bedrooms} onChange={(value) => updateNonNegative('bedrooms', value)} placeholder="2" type="number" />
            <ControlledField icon="bathtub" label="Bathrooms" value={form.bathrooms} onChange={(value) => updateNonNegative('bathrooms', value)} placeholder="2" type="number" />
          </>
        ) : (
          <>
            <ControlledField icon="square_foot" label="Plot size" value={form.plotSize} onChange={(value) => updateNonNegative('plotSize', value)} placeholder="Example: 2 or 450" type="number" />
            <ControlledSelect icon="straighten_outlined" label="Size unit" value={form.plotSizeUnit} options={plotSizeUnitOptions} onChange={(value) => update('plotSizeUnit', value)} />
          </>
        )}
        <ControlledSelect icon="map_outlined" label="Region" value={form.region} options={Object.keys(propertyRegionDistricts)} onChange={updateRegion} />
        <ControlledSelect icon="location_city_outlined" label="District" value={form.district} options={selectedDistrictOptions} onChange={(value) => update('district', value)} />
        <ControlledField icon="place_outlined" label="Ward" value={form.ward} onChange={(value) => update('ward', value)} placeholder="Type ward manually" />
        <ControlledField icon="near_me_outlined" label="Landmark" value={form.landmark} onChange={(value) => update('landmark', value)} placeholder="Near Slipway" />
        {!isPlot && (
          <div className="field wide amenity-picker">
            <span>Amenities</span>
            <div className="amenity-picker-grid">
              {propertyAmenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  className={selectedAmenities.includes(amenity) ? 'active' : ''}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {selectedAmenities.includes(amenity) && <Icon name="check" />}
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        )}
        <ControlledTextarea icon="notes_outlined" label="Description" value={form.description} onChange={(value) => update('description', value)} wide />
      </form>
      <button className="filled-button seller-full-action" type="button" onClick={captureLocation} disabled={locationLoading}>
        <Icon name="gps_fixed" /> {locationLoading ? 'Capturing GPS...' : 'Register Property Location'}
      </button>
      {message && <p className="seller-form-message">{message}</p>}
      {position && (
        <StaticLocationPreview
          listing={previewListing}
          latitude={position.latitude}
          longitude={position.longitude}
          accuracyMeters={position.accuracy}
        />
      )}
      <input
        ref={imageInputRef}
        className="visually-hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={pickImages}
      />
      <button className="outline-button seller-full-action" type="button" onClick={() => imageInputRef.current?.click()}>
        <Icon name="photo_library_outlined" /> Upload Images
      </button>
      {selectedImages.length > 0 && (
        <NoticeCard
          icon="perm_media_outlined"
          title="Selected Media"
          text={`${selectedImages.length} ${selectedImages.length === 1 ? 'image' : 'images'} selected.`}
        />
      )}
      <button className="filled-button seller-full-action" type="button" onClick={publishProperty}>
        <Icon name={position ? 'cloud_upload' : 'pending_actions_rounded'} />
        {position ? 'Publish Property' : 'Save as Pending'}
      </button>
      {toast && <Toast message={toast} />}
    </>
  )
}

function PropertyPublishSuccessScreen({result, setView, onUpload}) {
  const published = result?.published
  const title = published ? 'Property Published' : 'Property Saved as Pending'
  const message = published
    ? 'Your GPS-verified property is now published live for users to discover.'
    : 'Your property is saved in your seller workspace. Register GPS at the property location to publish it live.'

  return (
    <section className="property-publish-success">
      <div className={published ? 'publish-success-icon live' : 'publish-success-icon'}>
        <Icon name={published ? 'verified' : 'pending_actions_rounded'} />
      </div>
      <h1>{title}</h1>
      <p>{message}</p>
      {result?.listing && (
        <article className="publish-success-listing">
          <img src={primaryListingImage(result.listing)} alt="" />
          <div>
            <strong>{result.listing.title}</strong>
            <span>{result.listing.ward}, {result.listing.district}</span>
            <small>{listingPriceLabel(result.listing)}</small>
          </div>
        </article>
      )}
      <div className="publish-success-actions">
        <button className="filled-button" type="button" onClick={() => setView('properties')}>
          <Icon name="home_work_outlined" />
          View Properties
        </button>
        <button className="outline-button" type="button" onClick={onUpload}>
          <Icon name="add_home" />
          Add Another
        </button>
      </div>
    </section>
  )
}

function SellerAnalytics({listings, setView}) {
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)
  return (
    <>
      <BackTitle title="Property Analytics" subtitle="Track views and renter interest for each published property." onBack={() => setView('dashboard')} />
      <SellerAnalyticsSummary totalViews={totalViews} listingCount={listings.length} />
      <div className="analytics-list">
        {listings.length === 0 ? (
          <EmptyState icon="analytics" title="No Published Properties" message="Publish a property to start collecting views and renter interest." />
        ) : listings.map((listing) => <SellerPropertyAnalyticsCard key={listing.id} listing={listing} />)}
      </div>
    </>
  )
}

function SellerPaymentHistory({setView}) {
  return (
    <>
      <BackTitle title="Payment History" subtitle="Review subscription and listing payment activity." onBack={() => setView('dashboard')} />
      <PaymentComingSoonCard
        title="Payment History Coming Soon"
        message="Subscription payments and listing payment receipts will appear here once online payments are activated."
      />
    </>
  )
}

function SubscriptionScreen({setView}) {
  const [yearly, setYearly] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const packages = getPackagePlans(yearly)
  if (paymentMethod) {
    return <PaymentScreen setView={() => setPaymentMethod('')} method={paymentMethod} />
  }

  return (
    <>
      <BackTitle title="Choose Your Listing Package" subtitle="Choose a seller package for property publishing." onBack={() => setView('dashboard')} />
      <SubscriptionHero yearly={yearly} onBillingChanged={setYearly} />
      <div className="subscription-benefits">
        <SubscriptionBenefit icon="verified" title="Verified Trust" message="Show renters that your homes are real and location-ready." />
        <SubscriptionBenefit icon="trending_up_rounded" title="More Leads" message="Boost listing visibility across search and featured sections." />
        <SubscriptionBenefit icon="analytics" title="Broker Insights" message="Track views and know which properties attract attention." />
      </div>
      <div className="subscription-package-list">
        {packages.map((plan) => (
          <SubscriptionPackageCard
            key={plan.name}
            plan={plan}
            onChoose={() => setPaymentMethod(plan.name)}
          />
        ))}
      </div>
      <p className="subscription-footnote">
        Packages help brokers publish, promote, and manage rental listings professionally. Payments are handled securely before activation.
      </p>
    </>
  )
}

function getPackagePlans(yearly) {
  return yearly
    ? [
        {name: 'Basic', tagline: 'Up to 5 properties', price: 'TZS 12,000', cadence: 'per year', features: ['Up to 5 properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
        {name: 'Standard', tagline: 'Up to 10 properties', price: 'TZS 36,000', cadence: 'per year', highlighted: true, features: ['Up to 10 properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
        {name: 'Premium', tagline: 'Unlimited properties', price: 'TZS 60,000', cadence: 'per year', features: ['Unlimited properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
      ]
    : [
        {name: 'Basic', tagline: 'Up to 5 properties', price: 'TZS 1,000', cadence: 'per month', features: ['Up to 5 properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
        {name: 'Standard', tagline: 'Up to 10 properties', price: 'TZS 3,000', cadence: 'per month', highlighted: true, features: ['Up to 10 properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
        {name: 'Premium', tagline: 'Unlimited properties', price: 'TZS 5,000', cadence: 'per month', features: ['Unlimited properties', 'Photo uploads', 'GPS verified location', 'Video uploads']},
      ]
}

function SubscriptionHero({yearly, onBillingChanged}) {
  return (
    <section className="subscription-hero">
      <div className="subscription-hero-title">
        <Icon name="workspace_premium" />
        <h2>Nyumbadirect Seller Pro</h2>
      </div>
      <p>Publish more verified homes, showcase photo-rich listings, and get stronger visibility with tools built for rental brokers.</p>
      <div className="subscription-points">
        <SubscriptionHeroPoint label="Post and manage active rental listings" />
        <SubscriptionHeroPoint label="Promote properties to serious renters" />
        <SubscriptionHeroPoint label="Track views and improve listing performance" />
      </div>
      <div className="billing-toggle">
        <button className={!yearly ? 'active' : ''} type="button" onClick={() => onBillingChanged(false)}>
          Monthly
        </button>
        <button className={yearly ? 'active' : ''} type="button" onClick={() => onBillingChanged(true)}>
          Yearly
          <small>12 months</small>
        </button>
      </div>
    </section>
  )
}

function SubscriptionHeroPoint({label}) {
  return (
    <div className="subscription-point">
      <Icon name="check_circle" />
      <span>{label}</span>
    </div>
  )
}

function SubscriptionBenefit({icon, title, message}) {
  return (
    <article className="subscription-benefit">
      <Icon name={icon} />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </article>
  )
}

function SubscriptionPackageCard({plan, onChoose}) {
  return (
    <article className={`subscription-package-card ${plan.highlighted ? 'highlighted' : ''}`}>
      <div className="subscription-package-heading">
        <h3>{plan.name}</h3>
        {plan.highlighted && <span className="recommended-chip"><Icon name="star" /> Recommended</span>}
      </div>
      <p>{plan.tagline}</p>
      <div className="subscription-price">
        <strong>{plan.price}</strong>
        <span>{plan.cadence}</span>
      </div>
      <div className="subscription-feature-list">
        {plan.features.map((feature) => (
          <div key={feature}>
            <Icon name="check_circle" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <button className={plan.highlighted ? 'filled-button package-choice' : 'outline-button package-choice'} type="button" onClick={onChoose}>
        <Icon name={plan.highlighted ? 'workspace_premium' : 'arrow_forward_rounded'} />
        Choose {plan.name}
      </button>
    </article>
  )
}

function PaymentScreen({setView, method}) {
  const [toast, setToast] = useState('')
  const showComingSoon = (name) => {
    setToast(`${name} payments are coming soon.`)
    window.setTimeout(() => setToast(''), 2400)
  }

  return (
    <>
      <BackTitle title="Payment" subtitle="Pay with M-Pesa, Airtel Money, Tigo Pesa, or HaloPesa." onBack={setView} />
      <PageTitle title="Mobile Money Payment" subtitle="Pay with M-Pesa, Airtel Money, Tigo Pesa, or HaloPesa." />
      <PaymentComingSoonCard />
      <div className="payment-options">
        {['M-Pesa', 'Airtel Money', 'Tigo Pesa', 'HaloPesa'].map((name) => (
          <button key={name} type="button" onClick={() => showComingSoon(name)}>
            <Icon name={paymentIconFor(name)} />
            <div>
              <strong>{name}</strong>
              <span>Coming soon</span>
            </div>
            <Icon name="lock_clock_rounded" />
          </button>
        ))}
      </div>
      {toast && <Toast message={toast} />}
    </>
  )
}

function paymentIconFor(name) {
  if (name === 'Airtel Money') return 'cell_tower'
  if (name === 'Tigo Pesa') return 'account_balance_wallet'
  if (name === 'HaloPesa') return 'payments'
  return 'phone_android'
}

function PaymentComingSoonCard({
  title = 'Payments Coming Soon',
  message = 'Mobile money payments are being prepared. You will be able to complete payments here once activation is ready.',
}) {
  return (
    <section className="payment-coming-soon-card">
      <Icon name="lock_clock_rounded" />
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </section>
  )
}

function ProfileScreen({sellerMode, setSellerMode, sessionEmail, profile, setProfile, profilePhoto, setProfilePhoto, unreadMessageCount = 0, onMessagesPressed, onLogout}) {
  const [view, setView] = useState('profile')
  const [supportOpen, setSupportOpen] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }
  const openExternal = (url, failureMessage) => {
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) showToast(failureMessage)
  }
  const handleLogout = () => {
    setSellerMode(false)
    setProfilePhoto('')
    showToast('Logged out.')
    window.setTimeout(() => onLogout?.(), 500)
  }

  if (view === 'settings') return <SettingsScreen setView={setView} />
  if (view === 'login') return <AuthScreen mode="Login" setView={setView} />
  if (view === 'register') return <AuthScreen mode="Create Account" setView={setView} />
  if (view === 'edit') {
    return (
      <EditProfileScreen
        setView={setView}
        sessionEmail={sessionEmail}
        profile={profile}
        setProfile={setProfile}
        profilePhoto={profilePhoto}
        setProfilePhoto={setProfilePhoto}
      />
    )
  }
  return (
    <AppPage>
      <ProfilePageTitle profile={profile} />
      <ProfileHeader profile={profile} profilePhoto={profilePhoto} onEdit={() => setView('edit')} />
      <ProfileCommandPanel
        sellerMode={sellerMode}
        unreadMessageCount={unreadMessageCount}
        onSellerModeChanged={setSellerMode}
        onMessagesPressed={onMessagesPressed}
      />
      <ProfileDetailsCard profile={profile} />
      <section className="settings-group">
        <h3>Account Settings</h3>
        <SettingsTile
          icon="privacy_tip_outlined"
          title="Privacy Policy"
          subtitle="Data, profile, and account controls"
          onClick={() => openExternal(privacyPolicyUrl, 'Could not open privacy policy.')}
        />
        <SettingsTile
          icon="help_outline_rounded"
          title="Help & Support"
          subtitle="Get assistance from Nyumbadirect"
          onClick={() => setSupportOpen(true)}
        />
        <SettingsTile
          icon="logout_rounded"
          title="Logout"
          subtitle="Sign out of this account"
          destructive
          onClick={handleLogout}
        />
      </section>
      {supportOpen && (
        <HelpSupportSheet
          onClose={() => setSupportOpen(false)}
          onToast={showToast}
        />
      )}
      {toast && <Toast message={toast} />}
    </AppPage>
  )
}

function ProfilePageTitle({profile = defaultProfile}) {
  return (
    <header className="profile-page-title">
      <BrandLockup />
      <h1>Profile</h1>
      <p>{profile.fullName || 'Manage your account, seller tools, and conversations.'}</p>
    </header>
  )
}

function HelpSupportSheet({onClose, onToast}) {
  const openExternal = (url, failureMessage) => {
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) onToast(failureMessage)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="support-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-handle" type="button" aria-label="Close help and support" onClick={onClose} />
        <h2>Help & Support</h2>
        <SettingsTile
          icon="email_outlined"
          title={supportEmail}
          subtitle="Email NyumbaDirect support"
          onClick={() => {
            window.location.href = `mailto:${supportEmail}?subject=NyumbaDirect%20Support`
          }}
        />
        <div className="support-social-row">
          <button className="support-social-button instagram" type="button" onClick={() => openExternal(instagramUrl, 'Could not open this social link.')}>
            <span className="support-social-icon-wrap"><BrandSocialIcon name="instagram" /></span>
            <span>Instagram</span>
          </button>
          <button className="support-social-button tiktok" type="button" onClick={() => openExternal(tiktokUrl, 'Could not open this social link.')}>
            <span className="support-social-icon-wrap"><BrandSocialIcon name="tiktok" /></span>
            <span>TikTok</span>
          </button>
        </div>
      </section>
    </div>
  )
}

function Toast({message}) {
  return <div className="toast-message">{message}</div>
}

function BrandSocialIcon({name, className = ''}) {
  if (name === 'whatsapp') {
    return (
      <svg className={`brand-social-icon whatsapp ${className}`} viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#25D366" d="M16.02 3.2A12.6 12.6 0 0 0 5.08 22.07L3.6 28.8l6.84-1.61A12.6 12.6 0 1 0 16.02 3.2Z" />
        <path fill="#fff" d="M22.93 18.87c-.37-.19-2.18-1.08-2.52-1.2-.34-.13-.58-.19-.83.19-.24.37-.95 1.2-1.17 1.45-.22.24-.43.28-.8.09-.37-.19-1.56-.58-2.98-1.84-1.1-.98-1.84-2.19-2.06-2.56-.22-.37-.02-.57.16-.75.17-.16.37-.43.56-.65.19-.22.25-.37.37-.62.12-.24.06-.47-.03-.65-.09-.19-.83-2-.1-2.74-.22-.71-.45-.61-.83-.62l-.71-.01c-.25 0-.65.09-.99.47-.34.37-1.3 1.27-1.3 3.09 0 1.82 1.33 3.58 1.51 3.82.19.25 2.62 4 6.34 5.61.89.38 1.58.61 2.12.78.89.28 1.7.24 2.34.15.71-.11 2.18-.89 2.49-1.75.31-.86.31-1.59.22-1.75-.09-.15-.34-.24-.71-.43Z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    return <img className={`brand-social-icon instagram ${className}`} src={instagramIcon} alt="" />
  }
  if (name === 'tiktok') {
    return <img className={`brand-social-icon tiktok ${className}`} src={tiktokIcon} alt="" />
  }
  return (
    <svg className={`brand-social-icon tiktok ${className}`} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#25F4EE" d="M19.4 5.2h3.4c.3 2.4 1.8 4.5 4 5.5v3.5a9.2 9.2 0 0 1-4.1-1.1v7.8a6.7 6.7 0 1 1-6.7-6.7c.4 0 .8 0 1.2.1v3.7a3 3 0 1 0 2.2 2.9V5.2Z" />
      <path fill="#FE2C55" d="M21.1 5.2h1.7c.3 2.4 1.8 4.5 4 5.5v2.2c-2.4-.6-4.5-2-5.7-4v12a6.7 6.7 0 0 1-8.9 6.3 6.7 6.7 0 0 0 7.2-6.3V5.2h1.7Z" opacity=".9" />
      <path fill="#111" d="M19.4 5.2h2v15.7a4.7 4.7 0 1 1-4.7-4.7c.2 0 .4 0 .6.1v2.1a2.6 2.6 0 1 0 2.1 2.5V5.2Z" />
    </svg>
  )
}

function ConfirmDialog({title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, onCancel, onConfirm}) {
  return (
    <div className="confirm-dialog-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <section className="confirm-dialog-card">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="outline-button" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={destructive ? 'filled-button danger' : 'filled-button'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

function ProfileHeader({profile = defaultProfile, profilePhoto, onEdit}) {
  const initial = (profile.fullName || 'N').slice(0, 1).toUpperCase()
  return (
    <section className="profile-header-card">
      <button className={`profile-avatar ${profilePhoto ? 'has-photo' : ''}`} onClick={onEdit} aria-label="Edit profile photo">
        {profilePhoto ? <img src={profilePhoto} alt="" /> : initial}
      </button>
      <div className="profile-header-name">
        <h2>{profile.fullName || 'Nyumbadirect Guest'}</h2>
      </div>
      <button className="profile-edit-button" onClick={onEdit} aria-label="Edit profile">
        <Icon name="edit_rounded" />
      </button>
    </section>
  )
}

function ProfileCommandPanel({sellerMode, unreadMessageCount, onSellerModeChanged, onMessagesPressed}) {
  return (
    <section className="profile-command-panel">
      <div className="profile-command-heading">
        <span><Icon name="business_center_outlined" /></span>
        <strong>Account Workspace</strong>
      </div>
      <div className="profile-command-list">
        <ProfileCommandTile
          icon="storefront_rounded"
          title="Seller Mode"
          subtitle={sellerMode ? 'Seller tools are active' : 'Post and manage properties'}
          status={sellerMode ? 'Active' : 'Off'}
          highlighted={sellerMode}
          trailing={<Switch checked={sellerMode} onChange={onSellerModeChanged} />}
          onClick={() => onSellerModeChanged(!sellerMode)}
        />
        <ProfileCommandTile
          icon="mark_chat_unread"
          title="Messages"
          subtitle={unreadMessageCount === 0 ? 'Inbox is up to date' : `${unreadMessageCount} unread waiting`}
          status={unreadMessageCount === 0 ? 'Clear' : 'Unread'}
          highlighted={unreadMessageCount > 0}
          trailing={<Icon name="arrow_forward_rounded" />}
          onClick={onMessagesPressed}
        />
      </div>
    </section>
  )
}

function ProfileCommandTile({icon, title, subtitle, status, trailing, highlighted = false, onClick}) {
  return (
    <div
      className={highlighted ? 'profile-command-tile highlighted' : 'profile-command-tile'}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick?.()
      }}
    >
      <span className="profile-command-icon"><Icon name={icon} /></span>
      <span className="profile-command-copy">
        <span className="profile-command-title-row">
          <strong>{title}</strong>
          <em>{status}</em>
        </span>
        <small>{subtitle}</small>
      </span>
      <span className="profile-command-trailing">{trailing}</span>
    </div>
  )
}

function ProfileDetailsCard({profile = defaultProfile}) {
  const rows = [
    {icon: 'phone_outlined', label: 'Phone', value: profile.phone || 'Not added'},
    {customIcon: <BrandSocialIcon name="whatsapp" />, label: 'WhatsApp', value: profile.whatsappNumber || 'Not added'},
    {icon: 'location_on_outlined', label: 'Location', value: profile.location || 'Tanzania'},
    {icon: 'notes_outlined', label: 'Bio', value: profile.bio || 'Not added'},
  ]
  const completed = rows.filter((row) => row.value !== 'Not added').length
  return (
    <section className="profile-details-card">
      <div className="profile-details-heading">
        <span><Icon name="badge_outlined" /></span>
        <div>
          <h2>Account Details</h2>
          <p>Profile information visible across your account.</p>
        </div>
        <b>{completed}/4</b>
      </div>
      <div className="profile-detail-list">
        {rows.map((row) => (
          <div className={row.value === 'Not added' ? 'profile-detail-row missing' : 'profile-detail-row'} key={row.label}>
            <span>{row.customIcon || <Icon name={row.icon} />}</span>
            <div>
              <strong>{row.label}</strong>
              <small>{row.value}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PropertyGrid({listings, saved, toggleSaved, openListing}) {
  return (
    <div className="property-grid">
      {listings.map((listing) => (
        <PropertyCard
          key={listing.id}
          listing={listing}
          saved={saved.has(listing.id)}
          toggleSaved={() => toggleSaved(listing.id)}
          openListing={() => openListing(listing)}
        />
      ))}
    </div>
  )
}

function PropertyCard({listing, saved, toggleSaved, openListing}) {
  const galleryImages = propertyGalleryImages(listing)
  return (
    <article
      className="property-card"
      onClick={openListing}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openListing()
        }
      }}
    >
      <div className="property-image">
        <img src={primaryListingImage(listing)} alt="" />
        <span className="property-badge">{listing.purpose === 'Sale' ? 'For sale' : 'For rent'}</span>
        {galleryImages.length > 1 && <span className="property-photo-count"><Icon name="photo_library" />{galleryImages.length}</span>}
      </div>
      <div className="property-body">
        <div className="property-title-row">
          <h3>{listing.title}</h3>
          <button className="icon-button" onClick={(event) => { event.stopPropagation(); toggleSaved() }} aria-label="Save property">
            <Icon name={saved ? 'favorite' : 'favorite_border'} />
          </button>
        </div>
        <p className="location">{listing.ward}, {listing.district}</p>
        <p className="posted">{listing.posted}</p>
        <p className="price">{listingPriceLabel(listing)}</p>
        <div className="spec-row">
          {listing.type === 'Plot' ? (
            <Spec icon="square_foot" label={`${listing.plotSize} ${listing.plotSizeUnit}`} />
          ) : (
            <>
              <Spec icon="bed" label={listing.bedrooms} />
              <Spec icon="bathtub" label={listing.bathrooms} />
            </>
          )}
          {listing.isVerified && <Icon name="verified" className="verified" />}
        </div>
      </div>
    </article>
  )
}

function PropertyDetails({listing, sessionEmail = '', saved, toggleSaved, onBack, onChat, onViewMap, onViewTracked}) {
  const locationLabel = [listing.ward, listing.district, listing.landmark].filter(Boolean).join(', ')
  const whatsapp = listing.seller?.whatsappNumber || listing.seller?.phone || ''
  const phone = listing.seller?.phone || listing.seller?.whatsappNumber || ''
  const sellerEmail = `${listing.seller?.email || listing.seller_email || listing.sellerEmail || ''}`.trim().toLowerCase()
  const viewerEmail = `${sessionEmail || ''}`.trim().toLowerCase()
  const isOwner = Boolean(viewerEmail && sellerEmail && viewerEmail === sellerEmail)
  const galleryImages = propertyGalleryImages(listing)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const selectedImage = galleryImages[selectedImageIndex] || primaryListingImage(listing)
  const multipleImages = galleryImages.length > 1
  const viewTrackingLockRef = useRef('')
  useEffect(() => {
    setSelectedImageIndex(0)
  }, [listing.id])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [listing.id])
  useEffect(() => {
    if (!listing.id) return undefined
    if (viewTrackingLockRef.current === listing.id) return undefined
    const storageKey = `nyumbadirect:viewed:${listing.id}`
    const lastViewedAt = Number(window.localStorage.getItem(storageKey) || 0)
    if (Date.now() - lastViewedAt < 2 * 60 * 1000) return undefined
    viewTrackingLockRef.current = listing.id
    window.localStorage.setItem(storageKey, `${Date.now()}`)
    let active = true

    recordPropertyView(listing.id)
      .then((updatedListing) => {
        if (!active || !updatedListing) return
        onViewTracked?.(updatedListing)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [listing.id, onViewTracked])
  const moveImage = (direction) => {
    setSelectedImageIndex((current) => clamp(current + direction, 0, galleryImages.length - 1))
  }
  const openViewer = (index = selectedImageIndex) => {
    setSelectedImageIndex(index)
    setViewerOpen(true)
  }
  const shareListing = async () => {
    const url = propertyShareUrl(listing.id)
    const text = `${listing.title}\n${listingPriceLabel(listing)}\n${locationLabel}\n${url}`
    if (navigator.share) {
      await navigator.share({title: listing.title, text, url}).catch(() => {})
      return
    }
    try {
      await navigator.clipboard?.writeText(url)
    } catch (_) {
      window.prompt('Copy this property link:', url)
    }
  }

  return (
    <AppPage>
      <BackTitle title="Property Details" subtitle="View property information and contact the seller." onBack={onBack} />
      <article className="property-details-screen">
        <section className="property-details-gallery">
          <button className="property-details-main-image" type="button" onClick={() => openViewer()}>
            <img src={selectedImage} alt="" />
            <span className="property-details-zoom-hint"><Icon name="zoom_in" /> Tap to zoom</span>
          </button>
          <span className="property-details-badge">{listing.purpose === 'Sale' ? 'For sale' : 'For rent'}</span>
          <span className="property-details-counter">{selectedImageIndex + 1}/{galleryImages.length}</span>
          {multipleImages && (
            <>
              <button
                className="gallery-arrow left"
                type="button"
                onClick={(event) => { event.stopPropagation(); moveImage(-1) }}
                disabled={selectedImageIndex === 0}
                aria-label="Previous property photo"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                className="gallery-arrow right"
                type="button"
                onClick={(event) => { event.stopPropagation(); moveImage(1) }}
                disabled={selectedImageIndex === galleryImages.length - 1}
                aria-label="Next property photo"
              >
                <Icon name="chevron_right" />
              </button>
            </>
          )}
        </section>
        {multipleImages && (
          <div className="property-details-thumbnails" aria-label="Property photos">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={index === selectedImageIndex ? 'active' : ''}
                onClick={() => setSelectedImageIndex(index)}
                onDoubleClick={() => openViewer(index)}
                aria-label={`Show property photo ${index + 1}`}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="property-details-chip-row">
          <LabelChip label={listing.purpose === 'Sale' ? 'For sale' : 'For rent'} />
          <LabelChip label={listing.type} />
          {listing.isVerified ? (
            <LabelChip label="GPS Verified Location" icon="verified" />
          ) : (
            <LabelChip label="Pending Location" icon="pending_actions_rounded" />
          )}
          <LabelChip label="Available Now" />
        </div>

        <section className="property-details-main">
          <h1>{listing.title}</h1>
          <p className="property-details-location">{locationLabel}</p>
          <p className="property-details-posted">{listing.posted}</p>
          <strong className="property-details-price">{listingPriceLabel(listing)}</strong>

          <div className="property-details-metrics">
            {listing.type === 'Plot' ? (
              <span><Icon name="square_foot" />{listing.plotSize} {listing.plotSizeUnit}</span>
            ) : (
              <>
                <span><Icon name="bed" />{listing.bedrooms} Beds</span>
                <span><Icon name="bathtub" />{listing.bathrooms} Baths</span>
              </>
            )}
          </div>

          <p className="property-details-description">{listing.description}</p>
        </section>

        {listing.type !== 'Plot' && listing.amenities.length > 0 && (
          <section className="property-details-section">
            <SectionHeader title="Amenities" />
            <div className="amenity-row">
              {listing.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}
            </div>
          </section>
        )}

        <section className="property-details-section">
          <SectionHeader title={listing.isVerified ? 'Verified Location' : 'Pending Location'} />
          {listing.isVerified ? (
            <PropertyMapPreview listing={listing} onViewMap={onViewMap} />
          ) : (
            <NoticeCard
              icon="pending_actions_rounded"
              title="Location coordinates not registered"
              text="This property is pending until GPS coordinates are captured at the property location."
            />
          )}
        </section>

        <section className="property-details-actions">
          {!isOwner && (
            <div className="property-contact-grid">
              <a className="filled-button" href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : undefined} target="_blank" rel="noreferrer">
                <BrandSocialIcon name="whatsapp" /> WhatsApp
              </a>
              <button className="outline-button" type="button" onClick={onChat}>
                <Icon name="chat_bubble_rounded" /> Chat Now
              </button>
              <a className="outline-button" href={phone ? `tel:${phone}` : undefined}>
                <Icon name="call" /> Call Broker
              </a>
            </div>
          )}
          <div className="property-icon-actions">
            <button type="button" onClick={toggleSaved} aria-label="Save property">
              <Icon name={saved ? 'favorite' : 'favorite_border'} />
            </button>
            <button type="button" onClick={shareListing} aria-label="Share listing">
              <Icon name="share" />
            </button>
          </div>
          {isOwner && (
            <p className="property-owner-note">This is your listing, so contact actions are hidden for you.</p>
          )}
        </section>
      </article>
      {viewerOpen && (
        <PropertyImageViewer
          images={galleryImages}
          selectedIndex={selectedImageIndex}
          setSelectedIndex={setSelectedImageIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </AppPage>
  )
}

function PropertyMapPreview({listing, latitude, longitude, accuracyMeters, onViewMap, showCoordinates = false}) {
  const previewListing = listing || {
    id: 'location-preview',
    title: 'Property location',
    price: 0,
    latitude,
    longitude,
    isVerified: true,
  }
  const canViewMap = typeof onViewMap === 'function'
  return (
    <div className="property-details-map">
      <div
        className="property-map-touch-target"
        onClick={canViewMap ? onViewMap : undefined}
        role={canViewMap ? 'button' : undefined}
        tabIndex={canViewMap ? 0 : undefined}
        onKeyDown={(event) => {
          if (!canViewMap) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onViewMap()
          }
        }}
        aria-label={canViewMap ? 'View property on map' : 'Property map preview'}
      >
        <OpenStreetMapLayer listings={[previewListing]} activeListing={previewListing} detailed />
      </div>
      <div className="property-map-preview-card">
        {showCoordinates ? (
          <>
            <Icon name="gps_fixed" />
            <div>
              <strong>Live GPS location captured</strong>
              <span>Lat {Number(latitude).toFixed(5)}, Lng {Number(longitude).toFixed(5)}</span>
              {accuracyMeters ? <small>Accuracy +/- {Math.round(accuracyMeters)} m</small> : null}
            </div>
          </>
        ) : (
          <>
            <Icon name="location_on" />
            <div>
              <strong>{previewListing.title || 'Property location'}</strong>
              <span>{previewListing.ward || previewListing.district ? [previewListing.ward, previewListing.district].filter(Boolean).join(', ') : 'GPS verified location'}</span>
            </div>
            {canViewMap && (
              <button className="filled-button compact-map-button" type="button" onClick={onViewMap}>
                <Icon name="map_rounded" />
                View on map
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PropertyImageViewer({images, selectedIndex, setSelectedIndex, onClose}) {
  const [scale, setScale] = useState(1.1)
  const [offset, setOffset] = useState({x: 0, y: 0})
  const dragRef = useRef(null)
  const viewerPinchRef = useRef(null)
  const selectedImage = images[selectedIndex] || images[0]
  const multipleImages = images.length > 1
  const setZoom = (nextScale) => {
    const clampedScale = clamp(nextScale, 1, 5)
    setScale(clampedScale)
    if (clampedScale === 1) setOffset({x: 0, y: 0})
  }
  const moveImage = (direction) => {
    setSelectedIndex((current) => clamp(current + direction, 0, images.length - 1))
    setScale(1)
    setOffset({x: 0, y: 0})
  }
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') moveImage(-1)
      if (event.key === 'ArrowRight') moveImage(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })
  const startDrag = (event) => {
    if (scale <= 1) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }
  const dragImage = (event) => {
    if (!dragRef.current) return
    setOffset({
      x: dragRef.current.originX + event.clientX - dragRef.current.startX,
      y: dragRef.current.originY + event.clientY - dragRef.current.startY,
    })
  }
  const stopDrag = () => {
    dragRef.current = null
  }
  const handleTouchStart = (event) => {
    if (event.touches.length !== 2) return
    viewerPinchRef.current = {
      distance: touchDistance(event.touches),
      scale,
    }
  }
  const handleTouchMove = (event) => {
    if (event.touches.length !== 2 || !viewerPinchRef.current) return
    event.preventDefault()
    const nextDistance = touchDistance(event.touches)
    const ratio = nextDistance / Math.max(1, viewerPinchRef.current.distance)
    setZoom(viewerPinchRef.current.scale * ratio)
  }
  const handleTouchEnd = () => {
    viewerPinchRef.current = null
  }

  return (
    <div className="image-viewer-overlay" role="dialog" aria-modal="true" aria-label="Property photo viewer">
      <div className="image-viewer-topbar">
        <button type="button" onClick={onClose} aria-label="Close photo viewer">
          <Icon name="close" />
        </button>
        <span>{selectedIndex + 1} of {images.length}</span>
        <div className="image-viewer-zoom-controls">
          <button type="button" onClick={() => setZoom(scale - .5)} aria-label="Zoom out">
            <Icon name="remove" />
          </button>
          <button type="button" onClick={() => setZoom(scale + .5)} aria-label="Zoom in">
            <Icon name="add" />
          </button>
        </div>
      </div>
      <div
        className={scale > 1 ? 'image-viewer-stage zoomed' : 'image-viewer-stage'}
        onPointerDown={startDrag}
        onPointerMove={dragImage}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={stopDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => setZoom(scale > 1 ? 1 : 2.4)}
      >
        <img
          src={selectedImage}
          alt=""
          draggable="false"
          style={{transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`}}
        />
      </div>
      {multipleImages && (
        <>
          <button
            className="image-viewer-arrow left"
            type="button"
            onClick={() => moveImage(-1)}
            disabled={selectedIndex === 0}
            aria-label="Previous property photo"
          >
            <Icon name="chevron_left" />
          </button>
          <button
            className="image-viewer-arrow right"
            type="button"
            onClick={() => moveImage(1)}
            disabled={selectedIndex === images.length - 1}
            aria-label="Next property photo"
          >
            <Icon name="chevron_right" />
          </button>
        </>
      )}
    </div>
  )
}

function SearchBar({value = '', onChange, placeholder, readOnly = false, onFocus}) {
  return (
    <label className="search-card">
      <Icon name="search" className="search-icon" />
      <input
        value={value}
        readOnly={readOnly}
        placeholder={placeholder || 'Search by location, district, or property type'}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={onFocus}
      />
      <button type="button" className="search-button">Search</button>
    </label>
  )
}

function SectionHeader({title, action, onAction}) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  )
}

function PageTitle({title, subtitle}) {
  return (
    <header className="page-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}

function DataStatusBanner({status, message}) {
  if (!message) return null
  return (
    <div className={`data-status-banner ${status}`}>
      <Icon name={status === 'live' ? 'verified' : status === 'loading' ? 'cloud_upload' : 'info'} />
      <span>{message}</span>
    </div>
  )
}

function EmptyState({icon, title, message}) {
  return (
    <section className="empty-state">
      <Icon name={icon} />
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  )
}

function LabelChip({label, icon}) {
  return (
    <span className="label-chip">
      {icon && <Icon name={icon} />}
      {label}
    </span>
  )
}

function StatPill({icon, label, value}) {
  return (
    <div className="stat-pill">
      <Icon name={icon} />
      <div><strong>{label}</strong><span>{value}</span></div>
    </div>
  )
}

function compactNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${value}`
}

function Spec({icon, label}) {
  return <span className="spec"><Icon name={icon} />{label}</span>
}

function NoticeCard({icon, title, text}) {
  return (
    <section className="notice-card">
      <Icon name={icon} />
      <div><h2>{title}</h2><p>{text}</p></div>
    </section>
  )
}

function BackTitle({title, subtitle, onBack}) {
  return (
    <header className="back-title">
      <button onClick={onBack} aria-label="Back"><Icon name="arrow_back_rounded" /></button>
      <div><h1>{title}</h1><p>{subtitle}</p></div>
    </header>
  )
}

function PurposeChoice({icon, title, text}) {
  return (
    <article className="purpose-card">
      <Icon name={icon} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Icon name="arrow_forward_rounded" className="purpose-arrow" />
    </article>
  )
}

function Field({icon, label, placeholder, wide = false}) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span><Icon name={icon} /> {label}</span>
      <input placeholder={placeholder} />
    </label>
  )
}

function ControlledField({icon, label, value, onChange, placeholder, wide = false, type = 'text'}) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span><Icon name={icon} /> {label}</span>
      <input type={type} min={type === 'number' ? 0 : undefined} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function ControlledSelect({icon, label, value, options, onChange, wide = false}) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span><Icon name={icon} /> {label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function ControlledTextarea({icon, label, value, onChange, placeholder, wide = false}) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span><Icon name={icon} /> {label}</span>
      <textarea value={value} placeholder={placeholder} rows={4} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function PropertyPurposeChoiceCard({icon, title, subtitle, badge, highlights, accent = 'forest', onClick}) {
  return (
    <article className={`property-purpose-choice accent-${accent}`} onClick={onClick}>
      <div className="property-purpose-top">
        <Icon name={icon} />
        <span>{badge}</span>
      </div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="property-purpose-highlights">
        {highlights.map((item) => <small key={item}>{item}</small>)}
      </div>
      <div className="property-purpose-continue">
        <strong>Continue</strong>
        <Icon name="arrow_forward_rounded" />
      </div>
    </article>
  )
}

function StaticLocationPreview({listing, latitude, longitude, accuracyMeters}) {
  return (
    <>
      <SectionHeader title="Mini Map Preview" />
      <PropertyMapPreview listing={listing} latitude={latitude} longitude={longitude} accuracyMeters={accuracyMeters} showCoordinates />
    </>
  )
}

function SellerAnalyticsSummary({totalViews, listingCount}) {
  return (
    <section className="seller-analytics-summary">
      <Icon name="visibility_rounded" />
      <div>
        <h2>{compactNumber(totalViews)} total views</h2>
        <p>{listingCount} published {listingCount === 1 ? 'property' : 'properties'}</p>
      </div>
    </section>
  )
}

function SellerPropertyAnalyticsCard({listing}) {
  return (
    <article className="seller-analytics-card">
      <div className="seller-analytics-main">
        <img src={listing.image} alt="" />
        <div>
          <h3>{listing.title}</h3>
          <p>{listing.ward}, {listing.district}</p>
          <small>{listing.posted}</small>
        </div>
        <div className="seller-analytics-views">
          <strong>{compactNumber(listing.views)}</strong>
          <span>views</span>
        </div>
      </div>
    </article>
  )
}

function PackageCard({title, price, icon, recommended = false}) {
  return (
    <article className={recommended ? 'package-card recommended' : 'package-card'}>
      {recommended && <span className="recommended-chip"><Icon name="star" /> Recommended</span>}
      <Icon name={icon} />
      <h2>{title}</h2>
      <strong>{price}</strong>
      <p><Icon name="check_circle" /> Verified listing tools</p>
      <p><Icon name="check_circle" /> Broker contact support</p>
    </article>
  )
}

function SettingsScreen({setView}) {
  return (
    <AppPage>
      <BackTitle title="Settings" subtitle="App preferences and support documents." onBack={() => setView('profile')} />
      <section className="settings-group">
        <h3>Preferences</h3>
        <SettingsTile icon="notifications_none_rounded" title="Notifications" subtitle="Message and listing alerts" />
        <SettingsTile icon="location_on_outlined" title="Location" subtitle="Nearby rentals and map discovery" />
        <SettingsTile icon="language_rounded" title="Language" subtitle="English" />
      </section>
      <section className="settings-group">
        <h3>Legal</h3>
        <SettingsTile icon="privacy_tip_outlined" title="Privacy Policy" subtitle="Data and privacy details" />
        <SettingsTile icon="description_outlined" title="Terms" subtitle="Nyumbadirect platform rules" />
        <SettingsTile icon="help_outline_rounded" title="Help" subtitle="Contact support" />
      </section>
    </AppPage>
  )
}

function AuthScreen({mode, setView}) {
  const isLogin = mode === 'Login'
  return (
    <AppPage>
      <BackTitle title={mode} subtitle={isLogin ? 'Welcome back to Nyumbadirect.' : 'Create an account to unlock search, chat, and saved homes.'} onBack={() => setView('profile')} />
      <form className="auth-card">
        {!isLogin && <Field icon="person_outline" label="Full name" placeholder="Nyumbadirect User" />}
        <Field icon="mail" label="Email" placeholder="you@example.com" />
        <Field icon="lock_clock_rounded" label="Password" placeholder="Password" />
        <button type="button" className="filled-button">{isLogin ? 'Login' : 'Create Account'}</button>
      </form>
    </AppPage>
  )
}

function EditProfileScreen({setView, sessionEmail, profile = defaultProfile, setProfile, profilePhoto, setProfilePhoto}) {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(() => ({
    fullName: profile.fullName || '',
    location: profile.location || '',
    phone: profile.phone || '',
    whatsappNumber: profile.whatsappNumber || '',
    bio: profile.bio || '',
  }))
  const [selectedFile, setSelectedFile] = useState(null)
  const [cropRequest, setCropRequest] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const update = (key, value) => setForm((current) => ({...current, [key]: value}))
  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }
  const handlePhotoSelected = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCropRequest({file, url: URL.createObjectURL(file)})
    event.target.value = ''
  }
  const deletePhoto = () => {
    setSelectedFile(null)
    setProfilePhoto('')
  }
  const saveProfile = async () => {
    if (!sessionEmail || saving) return
    setSaving(true)
    let nextProfile = {
      ...profile,
      fullName: form.fullName.trim() || profile.fullName || 'Nyumbadirect Guest',
      phone: form.phone.trim(),
      whatsappNumber: form.whatsappNumber.trim(),
      location: form.location.trim() || 'Tanzania',
      bio: form.bio.trim(),
      profilePhotoUrl: profilePhoto || '',
    }
    try {
      if (selectedFile) {
        nextProfile = await uploadProfilePhoto({email: sessionEmail, file: selectedFile})
      } else if (!profilePhoto && profile.profilePhotoUrl) {
        nextProfile = await removeProfilePhoto(sessionEmail)
      }
      const result = await updateProfile({email: sessionEmail, profile: {...nextProfile, ...form, profilePhotoUrl: nextProfile.profilePhotoUrl || profilePhoto || ''}})
      setProfile(result.profile)
      setProfilePhoto(result.profile.profilePhotoUrl || '')
      saveStoredJson(accountKey(sessionEmail, 'profile'), result.profile)
      showToast('Profile updated.')
      window.setTimeout(() => setView('profile'), 500)
    } catch (error) {
      showToast(error.message || 'Profile was not saved to your account. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppPage>
      <BackTitle title="Edit Profile" subtitle="Update your account and contact details." onBack={() => setView('profile')} />
      <section className="edit-photo-card">
        <button className={`edit-photo-preview ${profilePhoto ? 'has-photo' : ''}`} type="button" onClick={() => fileInputRef.current?.click()}>
          {profilePhoto ? <img src={profilePhoto} alt="" /> : <Icon name="person_rounded" />}
        </button>
        <div>
          <h2>Profile Photo</h2>
          <p>Add a clear profile photo for brokers and renters.</p>
          <div className="edit-photo-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <Icon name="photo_library_outlined" />
              Add Photo
            </button>
            {profilePhoto && (
              <button type="button" onClick={deletePhoto}>
                <Icon name="delete_outline" />
                Delete
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelected}
          hidden
        />
      </section>
      <form className="property-form">
        <ControlledField icon="person_outline" label="Full name" value={form.fullName} onChange={(value) => update('fullName', value)} placeholder="Nyumbadirect User" />
        <ControlledField icon="location_on_outlined" label="Location" value={form.location} onChange={(value) => update('location', value)} placeholder="Tanzania" />
        <ControlledField icon="phone_outlined" label="Phone number" value={form.phone} onChange={(value) => update('phone', value)} placeholder="+255 7XX XXX XXX" />
        <ControlledField icon="chat_bubble_outline" label="WhatsApp number" value={form.whatsappNumber} onChange={(value) => update('whatsappNumber', value)} placeholder="+255 7XX XXX XXX" />
        <ControlledTextarea icon="notes_outlined" label="Bio" value={form.bio} onChange={(value) => update('bio', value)} placeholder="Tell owners or buyers what you need" wide />
        <button type="button" className="filled-button" onClick={saveProfile} disabled={saving}>
          <Icon name="save_rounded" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
      {cropRequest && (
        <ProfilePhotoCropDialog
          imageUrl={cropRequest.url}
          onCancel={() => {
            URL.revokeObjectURL(cropRequest.url)
            setCropRequest(null)
          }}
          onCrop={(file, url) => {
            URL.revokeObjectURL(cropRequest.url)
            setSelectedFile(file)
            setProfilePhoto(url)
            setCropRequest(null)
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </AppPage>
  )
}

function ProfilePhotoCropDialog({imageUrl, onCancel, onCrop}) {
  const imageRef = useRef(null)
  const [scale, setScale] = useState(1.18)
  const crop = () => {
    const image = imageRef.current
    if (!image) return
    const outputSize = 900
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const context = canvas.getContext('2d')
    context.fillStyle = '#faf9f6'
    context.fillRect(0, 0, outputSize, outputSize)
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight) / scale
    const sourceX = (image.naturalWidth - sourceSize) / 2
    const sourceY = (image.naturalHeight - sourceSize) / 2
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `profile-${Date.now()}.jpg`, {type: 'image/jpeg'})
      onCrop(file, URL.createObjectURL(blob))
    }, 'image/jpeg', .88)
  }

  return (
    <div className="profile-crop-overlay" role="dialog" aria-modal="true" aria-label="Crop profile picture">
      <section className="profile-crop-card">
        <div className="profile-crop-heading">
          <h2>Crop Profile Picture</h2>
          <button type="button" onClick={onCancel} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="profile-crop-frame">
          <img ref={imageRef} src={imageUrl} alt="" style={{transform: `scale(${scale})`}} />
        </div>
        <label className="profile-crop-slider">
          <span>Zoom</span>
          <input type="range" min="1" max="2.5" step="0.05" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
        </label>
        <div className="profile-crop-actions">
          <button className="outline-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="filled-button" type="button" onClick={crop}>Use Photo</button>
        </div>
      </section>
    </div>
  )
}

function DashboardCard({icon, label, value, accent = 'forest', onClick}) {
  return (
    <article className={`dashboard-card accent-${accent}`} onClick={onClick}>
      <Icon name={icon} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Icon name="arrow_outward_rounded" className="dashboard-arrow" />
    </article>
  )
}

function ChatThreadHeader({conversation, onBack, onProfile, onPhoto}) {
  return (
    <header className="chat-thread-header">
      <button type="button" onClick={onBack} aria-label="Back"><Icon name="arrow_back_rounded" /></button>
      <button className="chat-avatar profile-avatar-button" type="button" onClick={onPhoto || onProfile} aria-label="View profile picture">
        {conversation.image ? <img src={conversation.image} alt="" /> : conversation.title.slice(0, 1)}
      </button>
      <button className="chat-thread-profile-copy" type="button" onClick={onProfile}>
        <h1>{conversation.title}</h1>
        <p>{conversation.status || conversation.subtitle}</p>
      </button>
    </header>
  )
}

function ChatPersonTile({conversation, hasUnread = false, onOpen, onProfile, onPhoto, onDelete}) {
  const lastMessage = conversation.messages?.length
    ? conversation.messages[conversation.messages.length - 1].text
    : 'Tap to start chatting'

  return (
    <article className="chat-person-tile" onClick={onOpen}>
      <button
        className="chat-avatar profile-avatar-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          ;(onPhoto || onProfile)?.()
        }}
        aria-label="View profile picture"
      >
        {conversation.image ? <img src={conversation.image} alt="" /> : conversation.title.slice(0, 1)}
      </button>
      <div className="chat-person-copy">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onProfile?.()
          }}
        >
          {conversation.title}
        </button>
        <span className={hasUnread ? 'unread' : ''}>{lastMessage}</span>
        {conversation.status && <ChatPresenceText label={conversation.status} />}
      </div>
      <div className="chat-tile-trailing">
        {conversation.meta && <time>{conversation.meta}</time>}
        {hasUnread && <b />}
        {onDelete ? (
          <button
            type="button"
            aria-label="Delete chat"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <Icon name="delete_outline" />
          </button>
        ) : (
          <Icon name="chevron_right" />
        )}
      </div>
    </article>
  )
}

function ChatPresenceText({label}) {
  const online = label.toLowerCase().startsWith('online')
  return (
    <small className={online ? 'chat-presence online' : 'chat-presence'}>
      <i />
      {label}
    </small>
  )
}

function ChatUserProfile({user, onClose}) {
  const phone = user.phone || user.whatsappNumber || ''
  const [viewingPhoto, setViewingPhoto] = useState(false)
  return (
    <div className="chat-user-profile-overlay" role="dialog" aria-modal="true" aria-label="User profile">
      <section className="chat-user-profile-card">
        <button className="chat-user-profile-close" type="button" onClick={onClose} aria-label="Close profile">
          <Icon name="close" />
        </button>
        <button
          className="chat-user-profile-avatar"
          type="button"
          onClick={() => user.image && setViewingPhoto(true)}
          aria-label="View profile picture"
        >
          {user.image ? <img src={user.image} alt="" /> : (user.title || 'N').slice(0, 1)}
        </button>
        <h2>{user.title || 'Nyumbadirect User'}</h2>
        {user.status && <ChatPresenceText label={user.status} />}
        {user.email && <p>{user.email}</p>}
        {user.location && <p><Icon name="location_on" /> {user.location}</p>}
        {user.bio && <p>{user.bio}</p>}
        <div className="chat-user-profile-actions">
          {phone && (
            <a className="filled-button" href={`tel:${phone}`}>
              <Icon name="call" />
              Call
            </a>
          )}
          {user.whatsappNumber && (
            <a className="outline-button" href={`https://wa.me/${user.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <BrandSocialIcon name="whatsapp" />
              WhatsApp
            </a>
          )}
        </div>
      </section>
      {viewingPhoto && (
        <PropertyImageViewer
          images={[user.image]}
          selectedIndex={0}
          setSelectedIndex={() => {}}
          onClose={() => setViewingPhoto(false)}
        />
      )}
    </div>
  )
}

function ChatBubble({message, onDelete}) {
  return (
    <div className={message.fromUser ? 'chat-bubble mine' : 'chat-bubble'}>
      <p>{message.text}</p>
      <span>
        {message.time}
        {onDelete && (
          <button type="button" aria-label="Delete message" onClick={onDelete}>
            <Icon name="delete_outline" />
          </button>
        )}
      </span>
    </div>
  )
}

function SettingsTile({icon, title, subtitle, action, destructive = false, onClick}) {
  return (
    <div className={`settings-tile ${destructive ? 'destructive' : ''}`} onClick={onClick}>
      <Icon name={icon} />
      <div><strong>{title}</strong><small>{subtitle}</small></div>
      {action || <Icon name="chevron_right" className="chevron" />}
    </div>
  )
}

function Switch({checked, onChange}) {
  return (
    <button className={`switch ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span />
    </button>
  )
}
