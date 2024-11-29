<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, Key, Share2, User } from 'lucide-vue-next'
import { useMastodon } from '@/composables/useMastodon'
import { useStorage } from '@vueuse/core'
import { useToast } from '@/components/ui/toast/use-toast'

const { setAccessToken, clearAccessToken } = useMastodon()
const { toast } = useToast()

// API Key state
const geminiKey = useStorage('gemini_api_key', '')
const isLoading = ref(false)

// Mastodon auth state
const mastodonInstance = ref('mastodon.social')
const mastodonToken = useStorage('mastodon_token', '')
const mastodonUser = useStorage('mastodon_user', null)

// Add interface for user data
interface UserData {
  id?: number
  mastodon_id: string
  mastodon_instance: string
  display_name: string
  avatar_url: string
  mastodon_handle: string
  website: string
  location: string
  role: 'subscriber' | 'publisher'
  publisher_info?: string
  gemini_api?: string
}

// Modify profile state to match DB schema
const profile = useStorage<UserData>('user_profile', {
  mastodon_id: '',
  mastodon_instance: '',
  display_name: '',
  avatar_url: '',
  mastodon_handle: '',
  website: '',
  location: '',
  role: 'subscriber',
  publisher_info: '',
  gemini_api: ''
})

// Handle profile updates
const isProfileSaving = ref(false)

// Add function to check if user exists
const checkUserExists = async (handle: string) => {
  try {
    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT * FROM users WHERE mastodon_handle = ?",
            args: [{ type: "text", value: handle }]
          }
        }]
      })
    })

    const result = await response.json()
    return result?.results?.[0]?.rows?.[0]
  } catch (error) {
    console.error('Error checking user:', error)
    return null
  }
}

// Modify loadUserData function to properly load and set data
const loadUserData = async (handle: string) => {
  try {
    console.log('Loading user data for handle:', handle)
    
    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT * FROM users WHERE mastodon_handle = ?",
            args: [{ type: "text", value: handle }]
          }
        }]
      })
    })

    const result = await response.json()
    console.log('DB result:', result)

    const userData = result?.results?.[0]?.rows?.[0]
    
    if (userData) {
      console.log('Found user data:', userData)
      // Update profile with all database values
      profile.value = {
        mastodon_id: userData.mastodon_id,
        mastodon_instance: userData.mastodon_instance,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url,
        mastodon_handle: userData.mastodon_handle,
        website: userData.website || '',
        location: userData.location || '',
        role: userData.role || 'subscriber',
        publisher_info: userData.publisher_info || '',
        gemini_api: userData.gemini_api || ''
      }

      // Update the local storage for Gemini API key
      geminiKey.value = userData.gemini_api || ''
      
      return userData
    }
    
    console.log('No user data found')
    return null
  } catch (error) {
    console.error('Error loading user data:', error)
    return null
  }
}

// Update watch to handle Mastodon user changes
watch(mastodonUser, async (newUser) => {
  if (newUser) {
    const mastodonHandle = `@${newUser.acct}@${mastodonInstance.value}`
    const existingUser = await loadUserData(mastodonHandle)

    if (!existingUser) {
      // Create new user profile if doesn't exist
      const newProfile = {
        mastodon_id: newUser.id,
        mastodon_instance: mastodonInstance.value,
        display_name: newUser.display_name,
        avatar_url: newUser.avatar,
        mastodon_handle: mastodonHandle,
        website: '',
        location: '',
        role: 'subscriber',
        gemini_api: ''
      }

      // Save to database
      const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            type: "execute",
            stmt: {
              sql: `INSERT INTO users (
                      mastodon_id, mastodon_instance, display_name, avatar_url,
                      mastodon_handle, website, location, role, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              args: [
                { type: "text", value: newProfile.mastodon_id },
                { type: "text", value: newProfile.mastodon_instance },
                { type: "text", value: newProfile.display_name },
                { type: "text", value: newProfile.avatar_url },
                { type: "text", value: newProfile.mastodon_handle },
                { type: "text", value: newProfile.website },
                { type: "text", value: newProfile.location },
                { type: "text", value: newProfile.role }
              ]
            }
          }]
        })
      })

      if (!response.ok) {
        console.error('Failed to create new user')
        return
      }

      // Update local state
      profile.value = newProfile
    }
  }
})

// Modify saveProfile function to properly handle updates
const saveProfile = async () => {
  isProfileSaving.value = true
  
  try {
    // Validate that we have a mastodon handle
    if (!profile.value.mastodon_handle) {
      throw new Error('Please connect your Mastodon account first')
    }

    console.log('Saving profile:', {
      website: profile.value.website,
      location: profile.value.location,
      role: profile.value.role,
      handle: profile.value.mastodon_handle
    })

    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: `UPDATE users 
                  SET website = ?, 
                      location = ?, 
                      role = ?, 
                      updated_at = CURRENT_TIMESTAMP 
                  WHERE mastodon_handle = ?`,
            args: [
              { type: "text", value: profile.value.website },
              { type: "text", value: profile.value.location },
              { type: "text", value: profile.value.role },
              { type: "text", value: profile.value.mastodon_handle }
            ]
          }
        }]
      })
    })

    const result = await response.json()
    console.log('Update result:', result)

    // Check for SQL execution errors
    if (result.error) {
      throw new Error(result.error)
    }

    // Show success toast
    toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 3000,
    })

  } catch (error) {
    console.error('Failed to save profile:', error)
    // Show error toast
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to save profile',
      variant: "destructive",
      duration: 5000,
    })
  } finally {
    isProfileSaving.value = false
  }
}

// Handle avatar upload
const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  try {
    // Create a preview URL for the avatar
    profile.value.avatar = URL.createObjectURL(file)
    
    // Here you would typically upload the file to your storage service
    // and get back a permanent URL
    
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    profile.value.avatar = ''
  }
}

// Modify saveApiKey function to save to Turso
const saveApiKey = async () => {
  isLoading.value = true
  try {
    if (!profile.value.mastodon_handle) {
      throw new Error('Please connect your Mastodon account first')
    }

    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: `UPDATE users 
                  SET gemini_api = ?,
                      updated_at = CURRENT_TIMESTAMP 
                  WHERE mastodon_handle = ?`,
            args: [
              { type: "text", value: geminiKey.value },
              { type: "text", value: profile.value.mastodon_handle }
            ]
          }
        }]
      })
    })

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    // Show success toast
    toast({
      title: "Success",
      description: "API key saved successfully",
      duration: 3000,
    })

  } catch (error) {
    console.error('Failed to save API key:', error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to save API key',
      variant: "destructive",
      duration: 5000,
    })
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
    .then(async (user) => {
      mastodonUser.value = user
      
      // Construct mastodon handle
      const mastodonHandle = `@${user.acct}@${mastodonInstance.value}`
      console.log('Constructed handle:', mastodonHandle)
      
      // Load user data from Turso
      const userData = await loadUserData(mastodonHandle)
      
      if (!userData) {
        console.log('Creating new user profile')
        // Create new user profile if doesn't exist
        const newProfile = {
          mastodon_id: user.id,
          mastodon_instance: mastodonInstance.value,
          display_name: user.display_name,
          avatar_url: user.avatar,
          mastodon_handle: mastodonHandle,
          website: '',
          location: '',
          role: 'subscriber',
          gemini_api: ''
        }

        // Save to database
        const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              type: "execute",
              stmt: {
                sql: `INSERT INTO users (
                        mastodon_id, mastodon_instance, display_name, avatar_url,
                        mastodon_handle, website, location, role, created_at, updated_at
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                args: [
                  { type: "text", value: newProfile.mastodon_id },
                  { type: "text", value: newProfile.mastodon_instance },
                  { type: "text", value: newProfile.display_name },
                  { type: "text", value: newProfile.avatar_url },
                  { type: "text", value: newProfile.mastodon_handle },
                  { type: "text", value: newProfile.website },
                  { type: "text", value: newProfile.location },
                  { type: "text", value: newProfile.role }
                ]
              }
            }]
          })
        })

        if (!response.ok) {
          console.error('Failed to create new user')
          return
        }

        // Update local state
        profile.value = newProfile
      }
      
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
  // Clear Mastodon auth data
  clearAccessToken()
  mastodonToken.value = ''
  mastodonUser.value = null
  
  // Clear local storage
  localStorage.removeItem('mastodon_client')
  localStorage.removeItem('mastodon_token')
  localStorage.removeItem('mastodon_user')
  
  // Also clear Gemini API key
  geminiKey.value = ''
  
  // Reset profile data including gemini_api
  profile.value = {
    mastodon_id: '',
    mastodon_instance: '',
    display_name: '',
    avatar_url: '',
    mastodon_handle: '',
    website: '',
    location: '',
    role: 'subscriber',
    publisher_info: '',
    gemini_api: ''
  }
  
  // Clear storages
  localStorage.removeItem('user_profile')
  localStorage.removeItem('gemini_api_key')
  
  // No need to reload the page since we're handling the state cleanup
  // window.location.reload()
}

// Update the computed property to include the Mastodon instance
const parsedMastodonBio = computed(() => {
  if (!mastodonUser.value?.acct) return ''
  // Return the handle with instance
  return `@${mastodonUser.value.acct}@${mastodonInstance.value}`
})
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
      <!-- Profile Section -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg flex items-center gap-2">
            <User class="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="border rounded-lg divide-y">
            <!-- Mastodon Integration - Moved to top -->
            <div class="p-4">
              <div class="flex justify-between items-center">
                <p class="text-sm text-muted-foreground">
                  {{ mastodonUser ? 'Connected to Mastodon' : 'Connect to sync your profile' }}
                </p>
                <Button 
                  :variant="mastodonUser ? 'destructive' : 'outline'"
                  size="sm"
                  @click="mastodonUser ? disconnectMastodon() : authenticateMastodon()"
                >
                  {{ mastodonUser ? 'Disconnect' : 'Connect' }}
                </Button>
              </div>
            </div>

            <!-- Basic Profile -->
            <div class="p-4 space-y-4">
              <!-- Avatar and Mastodon Info -->
              <div class="flex items-center gap-4">
                <div class="relative h-16 w-16">
                  <img
                    v-if="mastodonUser?.avatar"
                    :src="mastodonUser.avatar"
                    alt="Profile avatar"
                    class="h-full w-full rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="h-full w-full rounded-full bg-muted flex items-center justify-center"
                  >
                    <User class="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-medium">{{ mastodonUser?.display_name || 'Profile' }}</h3>
                  <p class="text-sm text-muted-foreground">
                    {{ parsedMastodonBio || 'Connect Mastodon to show profile' }}
                  </p>
                </div>
              </div>

              <!-- Website -->
              <div class="grid grid-cols-3 gap-4 items-center">
                <label class="text-sm font-medium">Website</label>
                <div class="col-span-2">
                  <Input
                    v-model="profile.website"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>

              <!-- Location -->
              <div class="grid grid-cols-3 gap-4 items-center">
                <label class="text-sm font-medium">Location</label>
                <div class="col-span-2">
                  <Input
                    v-model="profile.location"
                    placeholder="Your location"
                  />
                </div>
              </div>

              <!-- Account Type -->
              <div class="grid grid-cols-3 gap-4 items-center">
                <label class="text-sm font-medium">Account Type</label>
                <div class="col-span-2">
                  <select
                    v-model="profile.role"
                    class="w-full rounded-md border bg-transparent p-2"
                  >
                    <option value="subscriber">Subscriber</option>
                    <option value="publisher">Publisher</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="p-4">
              <Button
                class="w-full"
                @click="saveProfile"
                :disabled="isProfileSaving"
              >
                {{ isProfileSaving ? 'Saving...' : 'Save Profile' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 60px);
}

textarea {
  @apply outline-none focus:ring-0 resize-none;
}

select {
  @apply outline-none focus:ring-0;
}
</style> 