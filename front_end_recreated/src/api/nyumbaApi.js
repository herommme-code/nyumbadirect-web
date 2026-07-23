const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin

const headers = {
  Accept: 'application/json',
}

export async function fetchPublicListings() {
  const url = apiUrl('/properties', {status: 'active'})
  const response = await fetch(url, {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return propertiesFromPayload(payload).map(propertyListingFromJson).filter(isActiveListing)
}

export async function fetchFavorites(email) {
  const response = await fetch(apiUrl('/favorites', {email: email.trim()}), {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return Array.isArray(payload.favorites) ? payload.favorites.map((item) => `${item}`.trim()).filter(Boolean) : []
}

export async function syncFavorites({email, favorites}) {
  const response = await fetch(apiUrl('/favorites/sync'), {
    method: 'PUT',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email.trim(),
      favorites: [...new Set((favorites || []).map((item) => `${item}`.trim()).filter(Boolean))].sort(),
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return Array.isArray(payload.favorites) ? payload.favorites.map((item) => `${item}`.trim()).filter(Boolean) : []
}

export async function fetchSyncEvents({email = '', sinceId = 0} = {}) {
  const response = await fetch(apiUrl('/sync/events', {
    email: email.trim(),
    since_id: sinceId || 0,
  }), {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return Array.isArray(payload.events) ? payload.events : []
}

export function syncStreamUrl({email = '', sinceId = 0} = {}) {
  return apiUrl('/sync/stream', {
    email: email.trim(),
    since_id: sinceId || 0,
  })
}

export async function recordPropertyView(listingId) {
  if (!listingId) return null
  const response = await fetch(apiUrl(`/properties/${encodeURIComponent(listingId)}/view`), {
    method: 'POST',
    headers,
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  const property = payload.property || payload.listing || payload.data?.property || payload.data
  return property && typeof property === 'object' && !Array.isArray(property)
    ? propertyListingFromJson(property)
    : null
}

export async function fetchProfile(email) {
  const response = await fetch(apiUrl('/auth/profile'), {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({email: email.trim()}),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, email).profile
}

export async function updateProfile({email, profile}) {
  const response = await fetch(apiUrl('/auth/profile'), {
    method: 'PUT',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email.trim(),
      name: profile.fullName,
      phone: profile.phone,
      whatsapp_number: profile.whatsappNumber,
      location: profile.location,
      bio: profile.bio,
      profile_photo_url: profile.profilePhotoUrl,
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, email)
}

export async function uploadProfilePhoto({email, file}) {
  const form = new FormData()
  form.set('email', email.trim())
  form.set('photo', file)
  const response = await fetch(apiUrl('/auth/profile/photo'), {
    method: 'POST',
    headers,
    body: form,
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, email).profile
}

export async function removeProfilePhoto(email) {
  const response = await fetch(apiUrl('/auth/profile/photo'), {
    method: 'DELETE',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({email: email.trim()}),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, email).profile
}

export async function fetchSellerListings(email) {
  const sellerEmail = email.trim()
  const response = await fetch(apiUrl('/seller/properties', {email}), {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return propertiesFromPayload(payload)
    .map(propertyListingFromJson)
    .map((listing) => ({
      ...listing,
      seller: listing.seller?.email ? listing.seller : {
        ...(listing.seller || {}),
        email: sellerEmail,
      },
    }))
    .filter((listing) => listing.id && listingBelongsToSeller(listing, sellerEmail))
}

export async function syncSellerListings({email, listings}) {
  const sellerEmail = email.trim()
  const scopedListings = listings.filter((listing) => listingBelongsToSeller(listing, sellerEmail))
  const response = await fetch(apiUrl('/seller/properties/sync'), {
    method: 'PUT',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: sellerEmail,
      properties: scopedListings.map((listing) => propertyListingToJson(listing, sellerEmail)),
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  const serverListings = propertiesFromPayload(payload).map(propertyListingFromJson).filter((listing) => listing.id)
  // A successful empty response is authoritative. Never restore stale browser
  // storage after a property was removed by Flutter or another web session.
  return serverListings.filter((listing) => listingBelongsToSeller(listing, sellerEmail))
}

export async function saveSellerListing({email, listing}) {
  const sellerEmail = email.trim()
  if (!listing?.id) throw new Error('The property ID is missing.')
  const response = await fetch(apiUrl(`/seller/properties/${encodeURIComponent(listing.id)}`), {
    method: 'PUT',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: sellerEmail,
      property: propertyListingToJson(listing, sellerEmail),
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) throw new Error(errorMessage(payload, response.status))
  return propertiesFromPayload(payload)
    .map(propertyListingFromJson)
    .filter((item) => item.id && listingBelongsToSeller(item, sellerEmail))
}

export async function uploadPropertyImages({email, listingId, files}) {
  if (!files.length) throw new Error('Select at least one property image.')

  // Modern phone photos are often 5-20 MB each. Resize them in the browser so
  // uploads finish faster on mobile data while preserving enough detail for a
  // property gallery. If a browser cannot process a file, use the original.
  const uploadFiles = await Promise.all(files.map(optimizedPropertyImageFile))

  const upload = async (filesToUpload) => {
    const form = new FormData()
    form.set('email', email.trim())
    for (const file of filesToUpload) form.append('images[]', file)

    const response = await fetch(apiUrl(`/seller/properties/${encodeURIComponent(listingId)}/images`), {
      method: 'POST',
      headers,
      body: form,
    })
    const payload = await decodeJson(response)
    if (!response.ok) {
      throw new Error(errorMessage(payload, response.status))
    }
    const property = payload.property || payload.listing || payload.data?.property || payload.data
    if (property && typeof property === 'object' && !Array.isArray(property)) {
      return propertyListingFromJson(property)
    }
    throw new Error('Property images uploaded, but no listing was returned.')
  }

  try {
    return await upload(uploadFiles)
  } catch (batchError) {
    if (uploadFiles.length === 1) throw batchError

    let uploadedListing = null
    for (const file of uploadFiles) {
      uploadedListing = await upload([file])
    }
    return uploadedListing
  }
}

async function optimizedPropertyImageFile(file) {
  if (!file?.type?.startsWith('image/') || file.size <= 1_500_000) return file
  if (typeof createImageBitmap !== 'function') return file

  try {
    const bitmap = await createImageBitmap(file)
    const maxSide = 1920
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d', {alpha: false}).drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.84))
    if (!blob || blob.size >= file.size) return file
    const filename = `${file.name.replace(/\.[^.]+$/, '') || 'property-image'}.jpg`
    return new File([blob], filename, {type: 'image/jpeg'})
  } catch {
    return file
  }
}

export async function loginUser({email, password}) {
  return authPost('/auth/login', {email, password})
}

export async function registerUser({email, password}) {
  return authPost('/auth/register', {email, password})
}

export async function googleLogin({idToken}) {
  const response = await fetch(apiUrl('/auth/google'), {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({id_token: idToken}),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, '')
}

export async function fetchChatConversations(email) {
  const response = await fetch(apiUrl('/conversations', {email}), {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  const conversations = Array.isArray(payload.conversations) ? payload.conversations : []
  return conversations.map(chatConversationFromJson).filter((conversation) => conversation.id)
}

export async function fetchChatUsers(email) {
  const response = await fetch(apiUrl('/auth/users', {email}), {headers})
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  const users = Array.isArray(payload.users) ? payload.users : []
  return users.map(appUserFromJson).filter((user) => user.email)
}

export async function sendChatMessage({email, text, listingId, recipientEmail}) {
  const response = await fetch(apiUrl('/conversations/messages'), {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email.trim(),
      body: text,
      ...(listingId ? {listing_id: listingId} : {}),
      ...(recipientEmail ? {recipient_email: recipientEmail} : {}),
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return {
    message: chatMessageFromJson(payload.message || {body: text, from_user: true, sent_at: new Date().toISOString()}),
    conversation: payload.conversation && typeof payload.conversation === 'object'
      ? chatConversationFromJson(payload.conversation)
      : null,
  }
}

export async function deleteChatConversation({email, conversationId}) {
  const response = await fetch(apiUrl(`/conversations/${encodeURIComponent(conversationId)}`, {email}), {
    method: 'DELETE',
    headers,
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
}

export async function markChatConversationRead({email, conversationId}) {
  const response = await fetch(apiUrl(`/conversations/${encodeURIComponent(conversationId)}/read`), {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({email: email.trim()}),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return payload
}

export async function deleteChatMessage({email, messageId}) {
  const response = await fetch(apiUrl(`/conversations/messages/${encodeURIComponent(messageId)}`, {email}), {
    method: 'DELETE',
    headers,
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
}

export async function deleteSellerListing({email, listingId}) {
  const response = await fetch(apiUrl(`/seller/properties/${encodeURIComponent(listingId)}`, {email}), {
    method: 'DELETE',
    headers,
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
}

async function authPost(path, body) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: body.email.trim(),
      password: body.password,
    }),
  })
  const payload = await decodeJson(response)
  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status))
  }
  return authResultFromPayload(payload, body.email)
}

function authResultFromPayload(payload, fallbackEmail) {
  const user = payload.user || {}
  return {
    message: payload.message || 'Logged in successfully.',
    email: `${user.email || fallbackEmail}`.trim(),
    profile: {
      fullName: user.name || user.fullName || 'Nyumbadirect Guest',
      phone: user.phone || '',
      whatsappNumber: user.whatsapp_number || user.whatsappNumber || '',
      location: user.location || 'Tanzania',
      bio: user.bio || 'Looking for verified rental homes.',
      profilePhotoUrl: resolveMediaUrl(user.profile_photo_url || user.profilePhotoUrl || ''),
    },
  }
}

async function decodeJson(response) {
  const text = await response.text()
  if (!text.trim()) return {}
  const cleanText = text.replace(/^\uFEFF/, '').trim()
  if (cleanText.startsWith('<!doctype') || cleanText.startsWith('<html') || cleanText.startsWith('<')) {
    throw new Error('The web app received HTML instead of API JSON. Please run through the /api proxy or configure the deployed host rewrite.')
  }
  return JSON.parse(cleanText)
}

function apiUrl(path, query = {}) {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${cleanBase}${cleanPath}`, window.location.origin)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim()) {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

function propertiesFromPayload(payload) {
  const direct = payload?.properties ||
    payload?.seller_properties ||
    payload?.sellerProperties ||
    payload?.public_properties ||
    payload?.publicProperties ||
    payload?.listings ||
    payload?.items ||
    payload?.results
  if (Array.isArray(direct)) return direct
  if (Array.isArray(payload?.data)) return payload.data

  const queue = [payload?.data, payload?.property, payload?.listing].filter(Boolean)
  const visited = new Set()
  const propertyKeys = [
    'properties',
    'seller_properties',
    'sellerProperties',
    'public_properties',
    'publicProperties',
    'listings',
    'items',
    'results',
    'data',
  ]
  while (queue.length) {
    const current = queue.shift()
    if (!current || typeof current !== 'object' || visited.has(current)) continue
    visited.add(current)
    if (Array.isArray(current)) return current
    for (const key of propertyKeys) {
      const value = current[key]
      if (Array.isArray(value)) return value
      if (value && typeof value === 'object') queue.push(value)
    }
  }
  return []
}

function propertyListingFromJson(json) {
  const purpose = listingPurposeFromAny(
    json.listing_purpose ||
    json.listingPurpose ||
    json.purpose ||
    json.listing_type ||
    json.listingType ||
    ((`${json.type || json.property_type || ''}`.toLowerCase() === 'plot') ? 'Sale' : null)
  )
  const imagePaths = mediaList(
    json.localImagePaths,
    json.local_image_paths,
    json.mainImageUrl,
    json.main_image_url,
    json.coverImageUrl,
    json.cover_image_url,
    json.thumbnailUrl,
    json.thumbnail_url,
    json.photoUrl,
    json.photo_url,
    json.images,
    json.imageUrls,
    json.image_urls,
    json.image_paths,
    json.photos,
    json.photo_urls,
    json.photoUrls,
    json.media,
    json.property_media,
    json.propertyMedia,
    json.property_images,
    json.propertyImages,
    json.gallery,
  )
  const imageUrl = resolveMediaUrl(
    imagePaths[0] ||
    json.imageUrl ||
    json.image_url ||
    json.primary_image_url ||
    json.mainImageUrl ||
    json.main_image_url ||
    json.coverImageUrl ||
    json.cover_image_url ||
    json.thumbnailUrl ||
    json.thumbnail_url ||
    json.photoUrl ||
    json.photo_url ||
    '',
  )
  const postedAt = dateFromAny(json.postedAt || json.posted_at || json.createdAt || json.created_at || json.publishedAt || json.published_at)

  return {
    id: `${json.id || json.property_id || json.propertyId || json.uuid || ''}`,
    title: `${json.title || ''}`,
    description: `${json.description || ''}`,
    price: intFromAny(json.price),
    purpose,
    type: `${json.type || json.property_type || ''}`,
    bedrooms: intFromAny(json.bedrooms || json.bedroom_count || json.beds),
    bathrooms: intFromAny(json.bathrooms || json.bathroom_count || json.baths),
    plotSize: `${json.plot_size || json.plotSize || ''}`,
    plotSizeUnit: `${json.plot_size_unit || json.plotSizeUnit || ''}`,
    region: `${json.region || ''}`,
    district: `${json.district || ''}`,
    ward: `${json.ward || ''}`,
    landmark: `${json.landmark || ''}`,
    latitude: numberFromAny(json.latitude || json.lat),
    longitude: numberFromAny(json.longitude || json.lng),
    amenities: stringList(json.amenities),
    isVerified: boolFromAny(json.isVerified || json.is_verified || json.verified || json.published || json.is_active || (`${json.status || ''}`.toLowerCase() === 'active')),
    isFeatured: boolFromAny(json.isFeatured || json.is_featured),
    image: imageUrl,
    imageUrl,
    localImagePaths: imagePaths.map(resolveMediaUrl),
    imageUrls: imagePaths.map(resolveMediaUrl),
    posted: postedTimeLabel(postedAt),
    postedAt,
    views: intFromAny(json.viewCount || json.view_count || json.views || json.totalViews || json.total_views),
    seller: sellerFromJson(json),
  }
}

function propertyListingToJson(listing, email) {
  const publicImages = [
    ...(listing.imageUrls || []),
    ...(listing.localImagePaths || []),
    ...(listing.images || []),
    ...(listing.photos || []),
    ...(listing.gallery || []),
  ].map(publicMediaPath).filter(Boolean)
  const uniquePublicImages = [...new Set(publicImages)]
  const primaryImage = publicMediaPath(listing.imageUrl || listing.image || publicImages[0] || '')
  const bedrooms = nonNegativeIntFromAny(listing.bedrooms)
  const bathrooms = nonNegativeIntFromAny(listing.bathrooms)
  const views = nonNegativeIntFromAny(listing.views)
  const price = nonNegativeIntFromAny(listing.price)
  const payload = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price,
    listing_purpose: listing.purpose,
    listingPurpose: listing.purpose,
    purpose: listing.purpose,
    type: listing.type,
    property_type: listing.type,
    bedrooms,
    bathrooms,
    plot_size: listing.plotSize,
    plotSize: listing.plotSize,
    plot_size_unit: listing.plotSizeUnit,
    plotSizeUnit: listing.plotSizeUnit,
    region: listing.region,
    district: listing.district,
    ward: listing.ward,
    landmark: listing.landmark,
    latitude: listing.latitude,
    longitude: listing.longitude,
    amenities: listing.amenities || [],
    is_verified: Boolean(listing.isVerified),
    isVerified: Boolean(listing.isVerified),
    is_featured: Boolean(listing.isFeatured),
    isFeatured: Boolean(listing.isFeatured),
    view_count: views,
    posted_at: listing.postedAt?.toISOString?.() || listing.postedAt || new Date().toISOString(),
    seller_email: listing.seller?.email || email,
    seller: {
      ...(listing.seller || {}),
      email: listing.seller?.email || email,
    },
  }
  if (primaryImage) {
    payload.image_url = primaryImage
    payload.imageUrl = primaryImage
  }
  if (uniquePublicImages.length) {
    payload.image_urls = uniquePublicImages
    payload.imageUrls = uniquePublicImages
    payload.local_image_paths = uniquePublicImages
    payload.localImagePaths = uniquePublicImages
  }
  return payload
}

function publicMediaPath(path) {
  if (path && typeof path === 'object') {
    return publicMediaPath(
      path.url ||
      path.full_url ||
      path.fullUrl ||
      path.public_url ||
      path.publicUrl ||
      path.image_url ||
      path.imageUrl ||
      path.image_path ||
      path.imagePath ||
      path.photo_url ||
      path.photoUrl ||
      path.photo_path ||
      path.photoPath ||
      path.file_url ||
      path.fileUrl ||
      path.file_path ||
      path.filePath ||
      path.path ||
      path.src ||
      '',
    )
  }
  const text = `${path || ''}`.trim()
  if (!text || text.startsWith('blob:') || text.startsWith('data:')) return ''
  if (text.startsWith('/assets/') || text.includes('/assets/')) return ''
  if (text.includes('/onboarding/')) return ''
  if (text.startsWith('seller-properties/') || text.startsWith('/storage/seller-properties/')) return text
  if (text.startsWith('storage/seller-properties/') || text.startsWith('/api/storage/seller-properties/')) return text
  try {
    const url = new URL(text)
    const publicPath = url.pathname
    if (publicPath.startsWith('/storage/seller-properties/') || publicPath.startsWith('/api/storage/seller-properties/')) return text
    return text
  } catch {
    // Keep other hosted paths out of destructive sync unless they are known public property images.
  }
  if (
    text.startsWith('uploads/') ||
    text.startsWith('property-images/') ||
    text.startsWith('property_images/') ||
    text.startsWith('properties/')
  ) return text
  return text
}

function listingBelongsToSeller(listing, email) {
  const sellerEmail = `${email || ''}`.trim().toLowerCase()
  if (!sellerEmail) return true
  const listingEmail = `${listing?.seller?.email || listing?.seller_email || listing?.sellerEmail || ''}`.trim().toLowerCase()
  return !listingEmail || listingEmail === sellerEmail
}

function sellerFromJson(json) {
  const seller = json.seller || json.owner || json.user || json.broker || json.landlord || {}
  const source = typeof seller === 'object' && seller !== null ? seller : json
  const email = source.email || json.seller_email || json.sellerEmail || json.owner_email || json.ownerEmail || ''
  const phone = source.phone || json.seller_phone || json.sellerPhone || json.owner_phone || json.ownerPhone || ''
  const whatsappNumber = source.whatsapp_number || source.whatsappNumber || source.whatsapp || json.seller_whatsapp || json.sellerWhatsapp || json.whatsapp_number || json.whatsappNumber || json.whatsapp || ''
  if (!`${email}${phone}${whatsappNumber}`.trim()) return null
  return {
    name: source.name || json.seller_name || json.sellerName || json.owner_name || json.ownerName || '',
    email: `${email}`,
    phone: `${phone}`,
    whatsappNumber: `${whatsappNumber}`,
    location: `${source.location || json.seller_location || json.sellerLocation || json.owner_location || json.ownerLocation || ''}`,
    bio: `${source.bio || json.seller_bio || json.sellerBio || ''}`,
    profilePhotoUrl: resolveMediaUrl(source.profile_photo_url || source.profilePhotoUrl || source.profile_photo || json.seller_profile_photo_url || json.sellerProfilePhotoUrl || json.profile_photo_url || json.profilePhotoUrl || ''),
    isOnline: boolFromAny(source.isOnline || source.is_online || source.online || json.seller_is_online || json.sellerIsOnline),
  }
}

function chatConversationFromJson(json) {
  const otherUser = json.other_user && typeof json.other_user === 'object' ? appUserFromJson(json.other_user) : null
  const listingId = `${json.listing_id || json.listingId || ''}`
  const messages = Array.isArray(json.messages)
    ? json.messages.map(chatMessageFromJson).filter((message) => message.text.trim())
    : []
  const lastMessage = messages[messages.length - 1]
  const unreadCount = intFromAny(
    json.unread_count ||
    json.unreadCount ||
    json.unread_messages ||
    json.unreadMessages ||
    json.unread ||
    json.new_messages ||
    json.newMessages,
  )
  const isUnread = unreadCount > 0 || boolFromAny(
    json.is_unread ||
    json.isUnread ||
    json.has_unread ||
    json.hasUnread ||
    json.has_new_messages ||
    json.hasNewMessages,
  )
  return {
    id: `${json.id || listingId || otherUser?.email || ''}`,
    kind: otherUser ? 'direct' : 'property',
    listingId,
    recipientEmail: otherUser?.email || '',
    title: otherUser?.title || json.title || (listingId ? 'Property Chat' : 'Chat'),
    subtitle: otherUser ? [otherUser.location, otherUser.bio].filter(Boolean).join(' - ') : `${json.subtitle || 'Property conversation'}`,
    status: otherUser?.status || '',
    meta: lastMessage?.time || '',
    image: otherUser?.image || '',
    user: otherUser,
    messages,
    unreadCount,
    isUnread,
  }
}

function chatMessageFromJson(json) {
  const sentAt = dateFromAny(json.sent_at || json.sentAt || json.created_at || json.createdAt) || new Date()
  return {
    id: `${json.id || `msg-${sentAt.getTime()}`}`,
    text: `${json.body || json.text || json.message || ''}`,
    fromUser: boolFromAny(json.from_user || json.fromUser || json.is_sender || json.mine),
    time: sentAt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    sentAt,
  }
}

function appUserFromJson(json) {
  const name = `${json.name || json.fullName || json.full_name || 'Nyumbadirect User'}`
  const email = `${json.email || ''}`
  const isOnline = boolFromAny(json.isOnline || json.is_online || json.online)
  const lastSeenAt = dateFromAny(
    json.lastSeenAt ||
    json.last_seen_at ||
    json.lastSeen ||
    json.last_seen ||
    json.last_active_at ||
    json.lastActiveAt ||
    json.updated_at ||
    json.updatedAt,
  )
  const recentlyActive = lastSeenAt && Date.now() - lastSeenAt.getTime() < 2 * 60 * 1000
  return {
    id: email || `${json.id || name}`,
    title: name.trim() || email,
    email,
    subtitle: [json.location, json.bio].filter(Boolean).join(' - '),
    location: `${json.location || ''}`,
    bio: `${json.bio || ''}`,
    phone: `${json.phone || ''}`,
    whatsappNumber: `${json.whatsapp_number || json.whatsappNumber || ''}`,
    image: resolveMediaUrl(json.profile_photo_url || json.profilePhotoUrl || ''),
    status: isOnline || recentlyActive ? 'Online now' : lastSeenAt ? `Offline · last seen ${relativeLongTimeLabel(lastSeenAt)}` : 'Offline',
    isOnline: isOnline || recentlyActive,
    lastSeenAt,
  }
}

function relativeLongTimeLabel(date) {
  return relativeTimeLabel(date)
}

function isActiveListing(listing) {
  return listing.isVerified || listing.latitude !== 0 || listing.longitude !== 0
}

function resolveMediaUrl(value) {
  const trimmed = `${value || ''}`.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    const localBackendHost = ['127.0.0.1', 'localhost', '10.0.2.2'].includes(url.hostname)
    if (!localBackendHost) {
      if (url.hostname === new URL(API_BASE_URL).hostname && url.pathname.startsWith('/api/storage/')) {
        return `${url.origin}${url.pathname.slice(4)}${url.search}`
      }
      return trimmed
    }
    return `${API_ORIGIN}${profilePhotoPublicPath(url.pathname)}${url.search}`
  } catch {
    if (trimmed.startsWith('/')) return `${API_ORIGIN}${profilePhotoPublicPath(trimmed)}`
    if (
      trimmed.startsWith('storage/') ||
      trimmed.startsWith('api/storage/') ||
      trimmed.startsWith('uploads/') ||
      trimmed.startsWith('property-images/') ||
      trimmed.startsWith('property_images/') ||
      trimmed.startsWith('properties/')
    ) {
      const normalized = trimmed.startsWith('api/storage/')
        ? trimmed.slice(4)
        : trimmed.startsWith('storage/')
          ? trimmed
          : `storage/${trimmed}`
      return `${API_ORIGIN}/${normalized}`
    }
    return trimmed
  }
}

function profilePhotoPublicPath(path) {
  if (path.startsWith('/api/profile-photos/')) {
    const fileName = path.slice('/api/profile-photos/'.length)
    return fileName ? `/storage/profile-photos/${fileName}` : path
  }
  for (const prefix of ['/storage/profile_photos/', '/storage/profile-photos/']) {
    if (path.startsWith(prefix)) {
      const fileName = path.slice(prefix.length)
      return fileName ? `/storage/profile-photos/${fileName}` : path
    }
  }
  return path
}

function postedTimeLabel(date) {
  if (!date) return 'Recently'
  return relativeTimeLabel(date)
}

function relativeTimeLabel(date) {
  const diffMs = Math.max(0, Date.now() - date.getTime())
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`

  const days = Math.floor(hours / 24)
  if (days < 28) return `${days} ${days === 1 ? 'day' : 'days'} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`

  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

function listingPurposeFromAny(value) {
  const text = `${value || ''}`.trim().toLowerCase()
  return text === 'sale' || text === 'sell' || text === 'for sale' ? 'Sale' : 'Rent'
}

function stringList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => `${item}`).filter((item) => item.trim())
}

function mediaList(...sources) {
  const values = []
  const add = (item) => {
    if (!item) return
    if (Array.isArray(item)) {
      item.forEach(add)
      return
    }
    if (typeof item === 'object') {
      add(
        item.url ||
        item.full_url ||
        item.fullUrl ||
        item.public_url ||
        item.publicUrl ||
        item.image_url ||
        item.imageUrl ||
        item.image_path ||
        item.imagePath ||
        item.photo_url ||
        item.photoUrl ||
        item.photo_path ||
        item.photoPath ||
        item.file_url ||
        item.fileUrl ||
        item.file_path ||
        item.filePath ||
        item.path ||
        item.src ||
        item.filename ||
        item.file_name ||
        item.fileName,
      )
      return
    }
    const text = `${item}`.trim()
    if (text && !values.includes(text)) values.push(text)
  }
  sources.forEach(add)
  return values
}

function intFromAny(value) {
  if (typeof value === 'number') return Math.round(value)
  return Number.parseInt(`${value || ''}`, 10) || 0
}

function nonNegativeIntFromAny(value) {
  return Math.max(0, intFromAny(value))
}

function numberFromAny(value) {
  if (typeof value === 'number') return value
  return Number.parseFloat(`${value || ''}`) || 0
}

function boolFromAny(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const text = `${value || ''}`.trim().toLowerCase()
  return text === 'true' || text === '1' || text === 'yes' || text === 'active' || text === 'online'
}

function dateFromAny(value) {
  const date = new Date(value || '')
  return Number.isNaN(date.getTime()) ? null : date
}

function errorMessage(payload, status) {
  return payload?.message || payload?.error || `Request failed (${status})`
}
