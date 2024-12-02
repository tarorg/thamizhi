import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export interface MastodonUser {
  id: string
  username: string
  display_name: string
  avatar: string
  instance: string
  acct: string
  note: string
  url: string
  followers_count: number
  following_count: number
  statuses_count: number
  last_status_at: string
  fields: Array<{ name: string; value: string }>
}

export const useMastodon = () => {
  // Use localStorage for persistent storage
  const accessToken = useStorage<string | null>('mastodon_token', null)
  const mastodonUser = useStorage<MastodonUser | null>('mastodon_user', null)
  const mastodonInstance = useStorage<string>('mastodon_instance', '')

  console.log('[useMastodon] Initializing with state:', {
    hasToken: !!accessToken.value,
    token: accessToken.value ? `${accessToken.value.substring(0, 10)}...` : null,
    instance: mastodonInstance.value,
    user: mastodonUser.value
  })

  // Ensure instance URL has protocol
  function normalizeInstanceUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  // Check if token is valid and fetch user data
  async function validateToken() {
    console.log('[validateToken] Starting validation:', { 
      hasToken: !!accessToken.value,
      token: accessToken.value ? `${accessToken.value.substring(0, 10)}...` : null,
      instance: mastodonInstance.value,
      currentUser: mastodonUser.value 
    })
    
    if (!accessToken.value || !mastodonInstance.value) {
      console.log('[validateToken] Missing token or instance')
      return false
    }
    
    try {
      const instanceUrl = normalizeInstanceUrl(mastodonInstance.value)
      const url = `${instanceUrl}/api/v1/accounts/verify_credentials`
      console.log('[validateToken] Fetching user credentials from:', url)
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[validateToken] Failed to validate token:', {
          status: response.status,
          error: errorText
        })
        clearAccessToken()
        return false
      }
      
      const userData = await response.json()
      console.log('[validateToken] Received user data:', userData)
      
      mastodonUser.value = {
        id: userData.id,
        username: userData.username,
        display_name: userData.display_name || userData.username,
        avatar: userData.avatar_static || userData.avatar,
        instance: instanceUrl,
        acct: userData.acct,
        note: userData.note,
        url: userData.url,
        followers_count: userData.followers_count,
        following_count: userData.following_count,
        statuses_count: userData.statuses_count,
        last_status_at: userData.last_status_at,
        fields: userData.fields || []
      }
      
      console.log('[validateToken] Updated mastodon user:', mastodonUser.value)
      return true
    } catch (e) {
      console.error('[validateToken] Error validating token:', e)
      clearAccessToken()
      return false
    }
  }

  async function setAccessToken(token: string, instance: string) {
    console.log('[setAccessToken] Setting new token:', { 
      token: `${token.substring(0, 10)}...`,
      instance 
    })
    
    const instanceUrl = normalizeInstanceUrl(instance)
    accessToken.value = token
    mastodonInstance.value = instanceUrl
    
    const valid = await validateToken()
    console.log('[setAccessToken] Token validation result:', valid)
    return valid
  }

  function clearAccessToken() {
    console.log('[clearAccessToken] Clearing token and user data')
    accessToken.value = null
    mastodonUser.value = null
    mastodonInstance.value = ''
  }

  function signOut() {
    console.log('[signOut] Signing out user')
    clearAccessToken()
  }

  // Check token validity on startup
  if (process.client && accessToken.value && mastodonInstance.value) {
    console.log('[useMastodon] Checking token on startup')
    validateToken()
  }

  return {
    mastodonUser,
    accessToken,
    mastodonInstance,
    setAccessToken,
    validateToken,
    signOut,
    clearAccessToken
  }
}