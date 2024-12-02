const CLIENT_NAME = 'Thamizhi'
const WEBSITE = 'https://thamizhi.org'
const REDIRECT_URI = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api/auth/mastodon/callback'
  : 'https://thamizhi.org/api/auth/mastodon/callback'
const SCOPES = 'read write follow'

interface AppCredentials {
  client_id: string
  client_secret: string
}

const instanceCredentials = new Map<string, AppCredentials>()

export async function generateAuthUrl(instance: string, handle: string): Promise<string> {
  try {
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
        throw new Error('Failed to register application with Mastodon instance')
      }

      credentials = await response.json()
      instanceCredentials.set(instance, credentials)
    }

    // Generate the authorization URL
    const params = new URLSearchParams({
      client_id: credentials.client_id,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      force_login: 'true'
    })

    return `https://${instance}/oauth/authorize?${params.toString()}`
  } catch (error) {
    console.error('Error generating auth URL:', error)
    throw error
  }
}
