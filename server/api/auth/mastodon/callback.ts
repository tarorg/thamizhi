export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { code, state } = query

    if (!code || !state) {
      throw new Error('Missing required parameters')
    }

    // Get the stored credentials from cookie
    const credentialsCookie = getCookie(event, 'mastodon_credentials')
    if (!credentialsCookie) {
      throw new Error('No credentials found')
    }

    const credentials = JSON.parse(credentialsCookie)
    const { instance, client_id, client_secret } = credentials

    // Verify state parameter matches the one we sent
    const storedState = state.toString()
    if (storedState !== state) {
      throw new Error('Invalid state parameter')
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(`https://${instance}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        redirect_uri: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/api/auth/mastodon/callback'
          : `https://thamizhi.xyz/api/auth/mastodon/callback`,
        grant_type: 'authorization_code',
        code: code,
        scope: 'read write follow'
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      throw new Error('Failed to exchange authorization code for token')
    }

    const { access_token } = await tokenResponse.json()

    // Clear the credentials cookie as it's no longer needed
    setCookie(event, 'mastodon_credentials', '', {
      maxAge: 0,
      path: '/'
    })

    // Set the access token in a cookie
    setCookie(event, 'mastodon_token', access_token, {
      httpOnly: false, // Allow JavaScript access
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    // Redirect to home page with success
    return sendRedirect(event, '/?auth=success')
  } catch (error: any) {
    console.error('Mastodon callback error:', error)
    return sendRedirect(event, `/signin?error=${encodeURIComponent(error.message)}`)
  }
})
