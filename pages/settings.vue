<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>
    
    <div class="space-y-6">
      <!-- Account Settings -->
      <div class="bg-card rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Account</h2>
        <div class="space-y-4">
          <div v-if="mastodonUser">
            <div class="flex items-center space-x-4">
              <img 
                :src="mastodonUser.avatar" 
                :alt="mastodonUser.display_name"
                class="w-12 h-12 rounded-full"
              />
              <div>
                <div class="font-medium">{{ mastodonUser.display_name }}</div>
                <div class="text-sm text-muted-foreground">@{{ mastodonUser.username }}</div>
                <div class="text-sm text-muted-foreground mt-1">
                  Role: {{ userRole || 'User' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gemini API Settings -->
      <div class="bg-card rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Gemini API</h2>
        <div class="flex items-center space-x-2">
          <input 
            v-model="geminiApiKey" 
            type="password" 
            placeholder="Enter Gemini API Key" 
            class="flex-grow input input-bordered w-full pr-10"
          />
          <Button 
            @click="saveGeminiApiKey" 
            variant="outline" 
            size="icon" 
            class="w-10 h-10"
          >
            <SaveIcon class="w-5 h-5" />
          </Button>
        </div>
        <p v-if="apiKeySaved" class="text-green-500 text-sm mt-2">
          API Key saved successfully
        </p>
        <p v-else-if="fetchedGeminiApiKey" class="text-blue-500 text-sm mt-2">
          Existing API Key loaded
        </p>
      </div>

      <!-- Appearance Settings -->
      <div class="bg-card rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Appearance</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>Theme</span>
            <Button @click="toggleTheme" variant="outline" class="w-32">
              {{ isDark ? 'Dark' : 'Light' }} Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { SaveIcon } from 'lucide-vue-next'
import { useMastodon } from '@/composables/useMastodon'
import { ref, onMounted, watch } from 'vue'
import { useStorage } from '@vueuse/core'

const { mastodonUser } = useMastodon()
const isDark = ref(false)
const userRole = useStorage('userRole', '')

// Gemini API Key Management
const geminiApiKey = useStorage('gemini_api_key', '')
const apiKeySaved = ref(false)
const fetchedGeminiApiKey = ref(false)

// Fetch user data (role and Gemini API) when Mastodon user is available
const fetchUserData = async () => {
  if (!mastodonUser.value) {
    console.error('No Mastodon user logged in')
    return
  }

  try {
    const tursoResponse = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql: "SELECT role, gemini_api FROM users WHERE mastodon_id = ?",
              args: [
                { type: "text", value: mastodonUser.value.id }
              ]
            }
          }
        ]
      })
    })

    const responseText = await tursoResponse.text()
    console.log('Fetch User Data Response:', responseText)

    if (tursoResponse.ok) {
      try {
        const responseData = JSON.parse(responseText)
        console.log('Parsed User Data Response:', responseData)
        
        if (responseData.results && 
            responseData.results[0].response?.result?.rows?.length > 0) {
          const row = responseData.results[0].response.result.rows[0]
          
          // Extract role and store it
          const roleValue = row[0]?.value || row.role?.value || 'user'
          userRole.value = roleValue 
          localStorage.setItem('userRole', roleValue) // Store in localStorage
          console.log('User Role Set:', roleValue)
          console.log('User Role Set and Stored:', roleValue) // Log role setting
          console.log('User Role Set and Stored:', roleValue) // Log role setting

          // Extract Gemini API key
          const geminiApiValue = row[1]?.value || row.gemini_api?.value || null
          if (geminiApiValue) {
            geminiApiKey.value = geminiApiValue
            fetchedGeminiApiKey.value = true
            console.log('Gemini API Key Set:', geminiApiValue)
          }
        } else {
          console.log('No user data found')
          userRole.value = 'user' // Set default role if no data found
          localStorage.setItem('userRole', 'user') // Store default role in localStorage
        }
      } catch (parseError) {
        console.error('Error parsing user data response:', parseError)
        userRole.value = 'user' // Set default role on error
        localStorage.setItem('userRole', 'user') // Store default role in localStorage
      }
    } else {
      console.error('Failed to fetch user data')
      userRole.value = 'user' // Set default role on error
      localStorage.setItem('userRole', 'user') // Store default role in localStorage
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    userRole.value = 'user' // Set default role on error
    localStorage.setItem('userRole', 'user') // Store default role in localStorage
  }
}

// Save Gemini API key
const saveGeminiApiKey = async () => {
  if (geminiApiKey.value.trim()) {
    try {
      if (!mastodonUser.value) {
        console.error('No Mastodon user logged in')
        return
      }

      // First, check if user exists in the database
      const checkUserResponse = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              type: "execute",
              stmt: {
                sql: "SELECT COUNT(*) as user_count FROM users WHERE mastodon_id = ?",
                args: [
                  { type: "text", value: mastodonUser.value.id }
                ]
              }
            }
          ]
        })
      })

      const checkUserResponseText = await checkUserResponse.text()
      console.log('Check User Response:', checkUserResponseText)

      let userExists = false
      try {
        const checkUserResponseData = JSON.parse(checkUserResponseText)
        // Correctly parse the nested response structure
        userExists = checkUserResponseData.results[0].response.result.rows[0][0].value > 0
        console.log('User Exists:', userExists)
      } catch (parseError) {
        console.error('Error parsing check user response:', parseError, checkUserResponseText)
        return
      }

      // Prepare the request body based on whether user exists
      const requestBody = {
        requests: [
          {
            type: "execute",
            stmt: userExists 
              ? {
                  sql: "UPDATE users SET gemini_api = ?, updated_at = CURRENT_TIMESTAMP WHERE mastodon_id = ?",
                  args: [
                    { type: "text", value: geminiApiKey.value },
                    { type: "text", value: mastodonUser.value.id }
                  ]
                }
              : {
                  sql: `
                    INSERT INTO users (
                      mastodon_id, 
                      mastodon_instance,
                      display_name, 
                      avatar_url, 
                      mastodon_handle,
                      gemini_api
                    ) VALUES (?, ?, ?, ?, ?, ?)
                  `,
                  args: [
                    { type: "text", value: mastodonUser.value.id },
                    { type: "text", value: mastodonUser.value.instance || '' },
                    { type: "text", value: mastodonUser.value.display_name },
                    { type: "text", value: mastodonUser.value.avatar },
                    { type: "text", value: `@${mastodonUser.value.username}` },
                    { type: "text", value: geminiApiKey.value }
                  ]
                }
          }
        ]
      }

      // Send the appropriate request (update or insert)
      const tursoResponse = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseText = await tursoResponse.text()
      console.log('Save Gemini API Response:', responseText)

      if (tursoResponse.ok) {
        // Store in local storage as a backup
        localStorage.setItem('gemini_api_key', geminiApiKey.value)
        
        apiKeySaved.value = true
        fetchedGeminiApiKey.value = true
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          apiKeySaved.value = false
        }, 3000)
      } else {
        console.error('Failed to save Gemini API key')
      }
    } catch (error) {
      console.error('Error saving Gemini API key:', error)
    }
  }
}

// Initialize data fetching
onMounted(() => {
  if (mastodonUser.value) {
    fetchUserData()
  }
})

// Watch for mastodon user changes
watch(() => mastodonUser.value, (newUser) => {
  if (newUser) {
    fetchUserData()
  } else {
    userRole.value = ''
    localStorage.setItem('userRole', '') // Clear user role from localStorage
    geminiApiKey.value = ''
    fetchedGeminiApiKey.value = false
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}
</script>