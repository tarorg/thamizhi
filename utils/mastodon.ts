const CLIENT_NAME = 'Thamizhi'
const WEBSITE = 'https://thamizhi.org'
const REDIRECT_URI = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api/auth/mastodon/callback'
  : 'https://thamizhi.xyz/api/auth/mastodon/callback'
const SCOPES = 'read write follow'

interface AppCredentials {
  client_id: string
  client_secret: string
}

// Store credentials in memory during development
const instanceCredentials = new Map<string, AppCredentials>()

export async function getAppCredentials(instance: string): Promise<AppCredentials> {
  let credentials = instanceCredentials.get(instance)
  
  if (!credentials) {
    // Register the application with the Mastodon instance
    const response = await fetch(`https://${instance}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: CLIENT_NAME,
        redirect_uris: REDIRECT_URI,
        scopes: SCOPES,
        website: WEBSITE
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to register app:', error)
      throw new Error('Failed to register application with Mastodon instance')
    }

    credentials = await response.json()
    instanceCredentials.set(instance, credentials)
  }

  return credentials
}

export async function generateAuthUrl(instance: string, handle: string, state: string): Promise<string> {
  try {
    const credentials = await getAppCredentials(instance)

    // Generate the authorization URL
    const params = new URLSearchParams({
      client_id: credentials.client_id,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      state: state
    })

    return `https://${instance}/oauth/authorize?${params.toString()}`
  } catch (error) {
    console.error('Error generating auth URL:', error)
    throw error
  }
}
