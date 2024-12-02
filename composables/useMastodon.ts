import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

// Use useStorage for persistent storage
const accessToken = useStorage<string | null>('mastodon_token', null)
const mastodonUser = useStorage('mastodon_user', null)

export function useMastodon() {
  // Check if token is valid
  async function validateToken() {
    if (!accessToken.value) return false
    
    try {
      const response = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      if (!response.ok) {
        clearAccessToken()
        return false
      }
      
      const user = await response.json()
      mastodonUser.value = user
      return true
    } catch (e) {
      clearAccessToken()
      return false
    }
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    validateToken() // Validate token when setting
  }

  function clearAccessToken() {
    accessToken.value = null
    mastodonUser.value = null
  }

  // Check token validity on startup
  if (process.client && accessToken.value) {
    validateToken()
  }

  return {
    accessToken,
    mastodonUser,
    setAccessToken,
    clearAccessToken,
    validateToken
  }
} 