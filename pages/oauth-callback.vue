<template>
  <div class="container max-w-lg mx-auto p-4 mt-8 text-center">
    <h2 class="text-xl font-semibold mb-4">Completing sign in...</h2>
    <p class="text-muted-foreground">Please wait while we verify your credentials.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from '#imports'
import { useMastodon } from '@/composables/useMastodon'

const router = useRouter()
const route = useRoute()
const { setAccessToken } = useMastodon()

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const storedState = localStorage.getItem('oauth_state')
    const instance = localStorage.getItem('mastodon_instance')
    const clientId = localStorage.getItem('client_id')
    const clientSecret = localStorage.getItem('client_secret')

    // Clean up stored OAuth state
    localStorage.removeItem('oauth_state')
    localStorage.removeItem('client_id')
    localStorage.removeItem('client_secret')

    if (!code || !state || !storedState || state !== storedState || !instance || !clientId || !clientSecret) {
      throw new Error('Invalid OAuth callback parameters')
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${window.location.origin}/oauth-callback`,
      grant_type: 'authorization_code',
      code,
      scope: 'read write follow'
    })

    const tokenResponse = await fetch(
      `${instance}/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams
      }
    )

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for access token')
    }

    const { access_token } = await tokenResponse.json()
    
    // Store the access token and validate it
    const valid = await setAccessToken(access_token, instance)
    if (!valid) {
      throw new Error('Failed to validate access token')
    }

    // Redirect to home page
    await router.push('/')
  } catch (error) {
    console.error('OAuth callback error:', error)
    await router.push('/signin?error=auth_failed')
  }
})
</script>
