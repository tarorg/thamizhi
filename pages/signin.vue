<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sign In Section -->
    <div class="w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-[500px]">
        <h2 class="text-2xl text-center font-semibold">Welcome</h2>
        <p class="text-center text-muted-foreground mt-2">
          Sign in with your Mastodon account
        </p>

        <div class="mt-8">
          <form @submit.prevent="handleSignIn" class="space-y-4">
            <div class="space-y-2">
              <Label for="mastodon-handle">Mastodon Handle</Label>
              <Input 
                id="mastodon-handle" 
                v-model="mastodonHandle"
                placeholder="@username@instance"
                type="text"
                :disabled="isLoading"
              />
            </div>
            <Button 
              type="submit" 
              variant="default"
              class="w-full"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Checking...' : 'Continue with Mastodon' }}
            </Button>
            <p class="text-sm text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <p class="text-sm text-center text-muted-foreground">
              Don't have a Mastodon account?{" "}
              <a 
                href="https://joinmastodon.org" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-[#563ACC] hover:underline"
              >
                Create one here
              </a>
            </p>
          </form>

          <!-- Error Alert -->
          <Alert v-if="error" variant="destructive" class="mt-4">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>

    <!-- Right Side Banner -->
    <div class="w-1/2 bg-purple-100 p-8 flex flex-col justify-center items-center text-center">
      <div 
        class="w-full max-w-[384px] h-64 bg-cover bg-center rounded-lg mb-6"
        style="background-image: url('/placeholder.svg?height=256&width=384')"
      ></div>
      <h2 class="text-2xl font-semibold text-purple-800 mb-4">Nature's Wisdom</h2>
      <blockquote class="text-lg text-purple-700 italic">
        "In every walk with nature one receives far more than he seeks."
      </blockquote>
      <p class="mt-2 text-purple-600">— John Muir</p>
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
const isLoading = ref(false)
const error = ref('')

async function handleSignIn() {
  try {
    isLoading.value = true
    error.value = ''
    
    if (!mastodonHandle.value) {
      throw new Error('Please enter your Mastodon handle')
    }

    // Parse mastodon handle to get instance and username
    const handleMatch = mastodonHandle.value.match(/@?([^@]+)@(.+)/)
    if (!handleMatch) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance')
    }

    const [, username, instance] = handleMatch
    const cleanHandle = `${username}@${instance}`

    try {
      // Try to fetch user info from Mastodon instance first
      const mastodonResponse = await fetch(`https://${instance}/api/v1/accounts/lookup?acct=${username}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!mastodonResponse.ok) {
        throw new Error('Could not verify Mastodon account. Please check your handle.')
      }

      const mastodonData = await mastodonResponse.json()
      
      if (!mastodonData.id) {
        throw new Error('Invalid Mastodon account data received')
      }

      // Check if user exists in Turso DB
      const checkResponse = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
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
              args: [
                { type: "text", value: cleanHandle }
              ]
            }
          }]
        })
      })

      const checkResult = await checkResponse.json()
      console.log('User check result:', checkResult) // Debug log
      
      if (!checkResponse.ok) {
        console.error('Check response error:', await checkResponse.text())
        throw new Error('Failed to check user status')
      }

      const userExists = checkResult.results?.[0]?.rows?.length > 0

      if (!userExists) {
        // Create new user in Turso DB
        const createResponse = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
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
                  mastodon_id, 
                  mastodon_instance, 
                  mastodon_handle, 
                  display_name, 
                  avatar_url, 
                  website, 
                  role,
                  created_at,
                  updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  { type: "text", value: mastodonData.id },
                  { type: "text", value: instance },
                  { type: "text", value: cleanHandle },
                  { type: "text", value: mastodonData.display_name || username },
                  { type: "text", value: mastodonData.avatar || '' },
                  { type: "text", value: mastodonData.website || '' },
                  { type: "text", value: 'subscriber' },
                  { type: "text", value: new Date().toISOString() },
                  { type: "text", value: new Date().toISOString() }
                ]
              }
            }]
          })
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.text()
          console.error('Create user error:', errorData)
          throw new Error('Failed to create user account')
        }

        const createResult = await createResponse.json()
        console.log('User creation result:', createResult) // Debug log
      }

      // Redirect to Mastodon OAuth
      window.location.href = `/api/auth/mastodon/login?instance=${encodeURIComponent(instance)}&handle=${encodeURIComponent(cleanHandle)}`

    } catch (fetchError: any) {
      console.error('API Error:', fetchError)
      if (fetchError.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.')
      }
      throw fetchError
    }

  } catch (err: any) {
    error.value = err.message || 'An error occurred'
    console.error('Sign in error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
