<template>
  <div class="container max-w-lg mx-auto p-4 mt-8 text-center">
    <h2 class="text-xl font-semibold mb-4">Completing sign in...</h2>
    <p class="text-muted-foreground">Please wait while we verify your credentials.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from '#imports'
import { useMastodon, MastodonUser } from '@/composables/useMastodon'

const router = useRouter()
const route = useRoute()
const { setAccessToken, mastodonUser } = useMastodon()

async function retrieveUserFromDatabase(mastodonUser: MastodonUser) {
  try {
    console.log('Attempting to retrieve user with Mastodon details:', {
      mastodonId: mastodonUser.id,
      mastodonHandle: mastodonUser.acct
    })
    
    // Sanitize the Mastodon ID to prevent SQL injection
    const sanitizedMastodonId = mastodonUser.id.replace(/[^0-9]/g, '')
    
    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
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
              sql: `SELECT * FROM users WHERE mastodon_id = '${sanitizedMastodonId}'`
            }
          },
          {
            type: "close"
          }
        ]
      })
    })

    // Log the raw response for debugging
    const responseText = await response.text()
    console.log('Raw Database Response:', responseText)

    // Check for specific error conditions
    if (responseText.includes('Cannot deserialize')) {
      throw new Error(`Deserialization Error: ${responseText}`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', {
        responseText,
        parseError
      })
      throw new Error(`Invalid JSON response: ${responseText}`)
    }

    // Validate the result structure
    if (!result || !result.results || !Array.isArray(result.results)) {
      throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`)
    }

    // Extract and transform the row data
    const rows = result.results[0]?.response?.result?.rows || []
    
    if (rows.length === 0) {
      console.log(`No user found with Mastodon ID: ${sanitizedMastodonId}`)
      return null
    }

    // Transform the row data into a more readable object
    const transformRow = (row) => {
      const transformedRow = {}
      result.results[0].response.result.cols.forEach((col, index) => {
        const value = row[index]
        transformedRow[col.name] = value?.value || null
      })
      return transformedRow
    }

    const processedUser = transformRow(rows[0])

    console.log('Processed User Data:', JSON.stringify(processedUser, null, 2))

    return processedUser
  } catch (error) {
    console.error('Detailed Error retrieving user from database:', {
      errorMessage: error.message,
      errorStack: error.stack,
      mastodonId: mastodonUser.id,
      mastodonHandle: mastodonUser.acct
    })
    return null
  }
}

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

    // Retrieve user data from Mastodon
    if (mastodonUser.value) {
      // Retrieve user from database using Mastodon handle
      const databaseUser = await retrieveUserFromDatabase(mastodonUser.value)
      
      // You can add additional logic here based on database user data
      if (databaseUser) {
        console.log('Existing user found in database:', databaseUser)
      } else {
        console.log('No user found in database. Consider registration flow.')
      }
    }

    // Redirect to home page
    await router.push('/')
  } catch (error) {
    console.error('OAuth callback error:', error)
    await router.push('/signin?error=auth_failed')
  }
})
</script>
