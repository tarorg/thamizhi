<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in with Mastodon
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your Mastodon handle to continue
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="mastodon-handle" class="block text-sm font-medium text-gray-700">
              Mastodon Handle
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                id="mastodon-handle"
                v-model="mastodonHandle"
                type="text"
                required
                :class="[
                  'block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md',
                  error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                ]"
                placeholder="username@instance"
                :disabled="loading"
              />
            </div>
            <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import Alert from '../components/ui/alert/Alert.vue'
import AlertTitle from '../components/ui/alert/AlertTitle.vue'
import AlertDescription from '../components/ui/alert/AlertDescription.vue'
import { AlertCircle } from 'lucide-vue-next'

const mastodonHandle = ref('')
const loading = ref(false)
const error = ref(null)

async function checkUserInDatabase(handle: string) {
  try {
    const cleanHandle = handle.replace(/^@/, '')
    console.log('Clean handle:', cleanHandle)
    
    const requestBody = {
      requests: [
        {
          type: "execute",
          stmt: {
            sql: `SELECT * FROM users WHERE mastodon_handle = '${cleanHandle}'`
          }
        },
        {
          type: "close"
        }
      ]
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    
    // Query Turso DB to check if user exists
    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DB check failed - Status:', response.status)
      console.error('DB check failed - Response:', errorText)
      throw new Error('Failed to verify user status')
    }

    const result = await response.json()
    console.log('DB check raw response:', JSON.stringify(result, null, 2))
    console.log('DB check results array:', result.results)
    console.log('First result rows:', result.results?.[0]?.rows)
    
    // Check if any user was found
    const userExists = result.results?.[0]?.rows?.length > 0
    console.log('User exists:', userExists)
    
    return userExists
  } catch (e) {
    console.error('Error checking user in database:', e)
    throw new Error('Failed to check user in database')
  }
}

async function verifyMastodonAccount(handle: string) {
  try {
    const cleanHandle = handle.replace(/^@/, '').split('@')[0] // Get just the username part
    console.log('Verifying Mastodon handle:', cleanHandle)
    
    const response = await fetch(`https://mastodon.social/api/v1/accounts/lookup?acct=${cleanHandle}`)
    
    if (!response.ok) {
      throw new Error('Could not verify Mastodon account. Please check your handle.')
    }

    const accountData = await response.json()
    console.log('Mastodon account data:', accountData)
    return accountData
  } catch (e) {
    console.error('Error verifying Mastodon account:', e)
    throw new Error('Could not verify Mastodon account. Please check your handle.')
  }
}

async function createUserInDatabase(userData: any) {
  try {
    const requestBody = {
      requests: [
        {
          type: "execute",
          stmt: {
            sql: `INSERT INTO users (
              mastodon_id, 
              mastodon_handle, 
              mastodon_instance, 
              display_name, 
              avatar_url,
              created_at,
              updated_at
            ) VALUES (
              '${userData.id}',
              '${userData.acct}',
              'mastodon.social',
              '${userData.display_name || userData.username}',
              '${userData.avatar}',
              DATETIME('now'),
              DATETIME('now')
            )`
          }
        },
        {
          type: "close"
        }
      ]
    }
    
    console.log('Create user request:', JSON.stringify(requestBody, null, 2))

    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DB create failed - Status:', response.status)
      console.error('DB create failed - Response:', errorText)
      throw new Error('Failed to create user account')
    }

    const result = await response.json()
    console.log('Create user response:', JSON.stringify(result, null, 2))
    return result
  } catch (e) {
    console.error('Create user error:', e)
    throw new Error('Failed to create user account')
  }
}

async function proceedToMastodonOAuth(handle: string) {
  try {
    const handleMatch = handle.match(/@?([^@]+)@(.+)/)
    if (!handleMatch) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance')
    }

    const [, username, instance] = handleMatch
    const cleanHandle = `${username}@${instance}`

    // Use router for client-side navigation
    const router = useRouter()
    
    // Build the login URL
    const loginUrl = `/api/auth/mastodon/login?${new URLSearchParams({
      instance: instance,
      handle: cleanHandle
    }).toString()}`

    // Navigate to the login endpoint
    window.location.href = loginUrl
  } catch (e) {
    console.error('Error proceeding to Mastodon OAuth:', e)
    throw e
  }
}

async function handleSubmit() {
  error.value = null
  loading.value = true

  try {
    if (!mastodonHandle.value) {
      throw new Error('Please enter your Mastodon handle')
    }

    // Validate handle format
    const handleMatch = mastodonHandle.value.match(/@?([^@]+)@(.+)/)
    if (!handleMatch) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance')
    }

    console.log('Checking user in database...')
    const userExists = await checkUserInDatabase(mastodonHandle.value)
    
    if (userExists) {
      console.log('User exists, proceeding to OAuth...')
      // User exists, proceed directly to Mastodon OAuth
      await proceedToMastodonOAuth(mastodonHandle.value)
    } else {
      console.log('User not found, verifying with Mastodon...')
      // User doesn't exist, verify with Mastodon first
      const verified = await verifyMastodonAccount(mastodonHandle.value)
      if (verified) {
        console.log('Mastodon verification successful, creating user...')
        // Create user in database
        await createUserInDatabase(verified)
        // Then proceed to OAuth
        await proceedToMastodonOAuth(mastodonHandle.value)
      } else {
        error.value = 'Could not verify Mastodon account. Please check your handle.'
      }
    }
  } catch (e) {
    console.error('Sign in error:', e)
    error.value = e.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}
</script>
