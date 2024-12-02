<template>
  <div class="container max-w-lg mx-auto p-4 mt-8">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Sign in with Mastodon</CardTitle>
        <CardDescription>
          Enter your Mastodon handle (e.g., @username@mastodon.social)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSignIn" class="space-y-4">
          <div class="space-y-2">
            <Input
              v-model="mastodonHandle"
              type="text"
              placeholder="@username@instance.social"
              :disabled="isLoading"
              class="w-full"
            />
            <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            <span v-if="isLoading">Connecting...</span>
            <span v-else>Continue</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from '#imports'
import { useMastodon } from '@/composables/useMastodon'

const router = useRouter()
const mastodonHandle = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleSignIn = async () => {
  if (!mastodonHandle.value) {
    errorMessage.value = 'Please enter your Mastodon handle'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // Extract instance from handle (e.g., @user@instance.social -> instance.social)
    const instance = mastodonHandle.value.split('@').filter(Boolean).pop()
    if (!instance) {
      throw new Error('Invalid Mastodon handle format. Please use format: @username@instance.social')
    }

    // Generate random state for OAuth security
    const state = Math.random().toString(36).substring(2)
    localStorage.setItem('oauth_state', state)

    // Store instance for later use
    localStorage.setItem('mastodon_instance', `https://${instance}`)

    // Construct OAuth URL
    const clientName = 'Thamizhi'
    const redirectUri = `${window.location.origin}/oauth-callback`
    const scope = 'read write follow'

    const registrationParams = new URLSearchParams({
      client_name: clientName,
      redirect_uris: redirectUri,
      scopes: scope,
      website: window.location.origin
    })

    // Register application with Mastodon instance
    const registrationResponse = await fetch(
      `https://${instance}/api/v1/apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: registrationParams
      }
    )

    if (!registrationResponse.ok) {
      throw new Error('Failed to register application with Mastodon instance')
    }

    const { client_id, client_secret } = await registrationResponse.json()

    // Store client credentials
    localStorage.setItem('client_id', client_id)
    localStorage.setItem('client_secret', client_secret)

    // Construct authorization URL
    const authParams = new URLSearchParams({
      client_id,
      scope,
      redirect_uri: redirectUri,
      response_type: 'code',
      state
    })

    // Redirect to Mastodon authorization page
    window.location.href = `https://${instance}/oauth/authorize?${authParams}`
  } catch (error) {
    console.error('Sign in error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to initiate sign in'
  } finally {
    isLoading.value = false
  }
}
</script>
