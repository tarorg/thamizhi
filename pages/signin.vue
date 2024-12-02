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
import { useRouter } from '#imports'
import { useMastodon } from '~/composables/useMastodon'
import { mastodonConfig } from '~/config/mastodon'

definePageMeta({
  layout: 'auth'
})

const mastodonHandle = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const { setAccessToken } = useMastodon()

async function verifyMastodonAccount(handle: string) {
  try {
    const handleMatch = handle.match(/@?([^@]+)@(.+)/)
    if (!handleMatch) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance')
    }

    const [, username, instance] = handleMatch
    console.log('Verifying Mastodon handle:', username, 'on instance:', instance)
    
    const response = await fetch(`https://${instance}/api/v1/accounts/lookup?acct=${username}`)
    
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

async function proceedToMastodonOAuth(handle: string) {
  try {
    const handleMatch = handle.match(/@?([^@]+)@(.+)/)
    if (!handleMatch) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance')
    }

    const [, username, instance] = handleMatch
    const cleanHandle = `${username}@${instance}`

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('oauth_state', state)
    
    // Build the OAuth URL directly
    const params = new URLSearchParams({
      client_id: mastodonConfig.clientId,
      redirect_uri: mastodonConfig.redirectUri,
      response_type: 'code',
      scope: mastodonConfig.scopes.join(' '),
      state,
    })

    // Redirect to Mastodon instance's OAuth endpoint
    window.location.href = `https://${instance}/oauth/authorize?${params.toString()}`
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

    // Verify with Mastodon
    console.log('Verifying with Mastodon...')
    const verified = await verifyMastodonAccount(mastodonHandle.value)
    if (verified) {
      console.log('Mastodon verification successful, proceeding to OAuth...')
      await proceedToMastodonOAuth(mastodonHandle.value)
    } else {
      error.value = 'Could not verify Mastodon account. Please check your handle.'
    }
  } catch (e) {
    console.error('Sign in error:', e)
    error.value = e.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}
</script>
