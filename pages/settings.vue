<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, Key, Share2 } from 'lucide-vue-next'
import { useMastodon } from '@/composables/useMastodon'
import { useStorage } from '@vueuse/core'

const { setAccessToken, clearAccessToken } = useMastodon()

// API Key state
const geminiKey = useStorage('gemini_api_key', '')
const isLoading = ref(false)

// Mastodon auth state
const mastodonInstance = ref('mastodon.social')
const mastodonToken = useStorage('mastodon_token', '')
const mastodonUser = useStorage('mastodon_user', null)

// Save API key
const saveApiKey = () => {
  isLoading.value = true
  try {
    geminiKey.value = geminiKey.value
  } finally {
    isLoading.value = false
  }
}

// Mastodon authentication
const authenticateMastodon = async () => {
  try {
    // First, register the application
    const response = await fetch(`https://${mastodonInstance.value}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: 'தமிழி',
        redirect_uris: window.location.origin + '/settings',
        scopes: 'read write follow',
        website: window.location.origin
      })
    })

    const app = await response.json()
    localStorage.setItem('mastodon_client', JSON.stringify(app))

    // Redirect to authorization page
    const authUrl = `https://${mastodonInstance.value}/oauth/authorize?` + new URLSearchParams({
      client_id: app.client_id,
      response_type: 'code',
      redirect_uri: window.location.origin + '/settings',
      scope: 'read write follow'
    })

    window.location.href = authUrl
  } catch (error) {
    console.error('Mastodon auth error:', error)
  }
}

// Handle OAuth callback
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  
  if (code) {
    let clientData
    try {
      clientData = JSON.parse(localStorage.getItem('mastodon_client') || '{}')
      if (!clientData.client_id || !clientData.client_secret) {
        throw new Error('Invalid client data')
      }
    } catch (e) {
      console.error('Failed to parse client data:', e)
      return
    }
    
    // Exchange code for token
    fetch(`https://${mastodonInstance.value}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientData.client_id,
        client_secret: clientData.client_secret,
        redirect_uri: window.location.origin + '/settings',
        grant_type: 'authorization_code',
        code,
        scope: 'read write follow'
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to get token')
      return res.json()
    })
    .then(data => {
      if (!data.access_token) throw new Error('No access token received')
      
      setAccessToken(data.access_token)
      mastodonToken.value = data.access_token
      
      // Get user info
      return fetch(`https://${mastodonInstance.value}/api/v1/accounts/verify_credentials`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`
        }
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to get user info')
      return res.json()
    })
    .then(user => {
      mastodonUser.value = user
      // Clear the URL parameters after successful auth
      window.history.replaceState({}, '', '/settings')
    })
    .catch(error => {
      console.error('Authentication error:', error)
      // Clean up on error
      disconnectMastodon()
    })
  }
})

// Disconnect Mastodon
const disconnectMastodon = () => {
  clearAccessToken()
  mastodonToken.value = ''
  mastodonUser.value = null
  localStorage.removeItem('mastodon_client')
  localStorage.removeItem('mastodon_token')
  localStorage.removeItem('mastodon_user')
  
  // Optional: Refresh the page to ensure clean state
  window.location.reload()
}
</script>

<template>
  <div class="container max-w-3xl mx-auto p-4">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-8">
      <Settings class="w-5 h-5" />
      <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <!-- Settings Table -->
    <div class="space-y-6">
      <!-- API Keys Section -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg flex items-center gap-2">
            <Key class="w-4 h-4" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="border rounded-lg divide-y">
            <!-- Gemini API Key -->
            <div class="p-4">
              <div class="grid grid-cols-3 gap-4 items-center">
                <div class="col-span-1">
                  <label class="text-sm font-medium">Gemini API Key</label>
                </div>
                <div class="col-span-2 flex gap-2">
                  <Input
                    v-model="geminiKey"
                    type="password"
                    placeholder="Enter API key"
                  />
                  <Button 
                    @click="saveApiKey"
                    :disabled="isLoading"
                    size="default"
                  >
                    {{ isLoading ? 'Saving...' : 'Save' }}
                  </Button>
                </div>
              </div>
              <div class="mt-2">
                <p class="text-sm text-muted-foreground">
                  Get your API key from 
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank"
                    class="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Social Authentication -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg flex items-center gap-2">
            <Share2 class="w-4 h-4" />
            Social Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="border rounded-lg divide-y">
            <!-- Mastodon -->
            <div class="p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium mb-1">Mastodon</h3>
                  <p class="text-sm text-muted-foreground">
                    Connect your Mastodon account to interact with posts
                  </p>
                </div>
                <div v-if="!mastodonUser">
                  <Button 
                    variant="outline"
                    @click="authenticateMastodon"
                  >
                    Connect
                  </Button>
                </div>
                <div v-else class="text-right">
                  <div class="flex items-center gap-2 mb-2">
                    <img 
                      :src="mastodonUser.avatar" 
                      :alt="mastodonUser.display_name"
                      class="w-6 h-6 rounded-full"
                    />
                    <span class="font-medium">{{ mastodonUser.display_name }}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    @click="disconnectMastodon"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 60px);
}
</style> 