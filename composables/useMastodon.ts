import { ref, computed, onMounted, watch } from 'vue'
import { useStorage } from '@vueuse/core'

// Use useStorage for persistent storage
const accessToken = useStorage<string | null>('mastodon_token', null)
const mastodonUser = useStorage('mastodon_user', null)
const isLoading = ref(false)

export function useMastodon() {
  // Computed property for authentication state
  const isAuthenticated = computed(() => {
    console.log('Checking auth state:', { token: accessToken.value, user: mastodonUser.value })
    return !!accessToken.value
  })

  // Check if token is valid
  async function validateToken() {
    if (!accessToken.value) {
      console.log('No token found during validation')
      return false
    }
    
    try {
      console.log('Validating token:', accessToken.value)
      isLoading.value = true
      const response = await fetch('https://mastodon.social/api/v1/accounts/verify_credentials', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      if (!response.ok) {
        console.log('Token validation failed:', await response.text())
        clearAccessToken()
        return false
      }
      
      const user = await response.json()
      console.log('Token validation successful, user:', user)
      mastodonUser.value = user
      return true
    } catch (e) {
      console.error('Token validation error:', e)
      clearAccessToken()
      return false
    } finally {
      isLoading.value = false
    }
  }

  function setAccessToken(token: string) {
    console.log('Setting access token:', token)
    accessToken.value = token
    validateToken() // Validate token when setting
  }

  function clearAccessToken() {
    console.log('Clearing access token')
    accessToken.value = null
    mastodonUser.value = null
  }

  async function logout() {
    console.log('Logging out')
    clearAccessToken()
    const router = useRouter()
    router.push('/')
  }

  // Check for token in cookie on client side
  onMounted(() => {
    console.log('Mounted: Checking for token in cookie')
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('mastodon_token='))
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1]
      console.log('Found token in cookie:', token)
      if (token && !accessToken.value) {
        setAccessToken(token)
      }
    }
  })

  // Watch for token changes
  watch(accessToken, (newToken) => {
    console.log('Token changed:', newToken)
    if (newToken) {
      validateToken()
    }
  })

  // Check token validity on startup
  if (process.client && accessToken.value) {
    validateToken()
  }

  return {
    accessToken,
    mastodonUser,
    isAuthenticated,
    isLoading,
    setAccessToken,
    clearAccessToken,
    validateToken,
    logout
  }
}