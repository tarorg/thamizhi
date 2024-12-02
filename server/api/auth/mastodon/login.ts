import { generateAuthUrl, getAppCredentials } from '~/utils/mastodon'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { instance, handle, state } = query

    if (!instance || !handle || !state) {
      throw new Error('Missing required parameters')
    }

    // Get app credentials and store them in memory
    const credentials = await getAppCredentials(instance.toString())

    // Store credentials in cookie for the callback
    setCookie(event, 'mastodon_credentials', JSON.stringify({
      instance: instance.toString(),
      client_id: credentials.client_id,
      client_secret: credentials.client_secret
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    // Generate OAuth URL for the specific instance
    const authUrl = await generateAuthUrl(
      instance.toString(), 
      handle.toString(),
      state.toString()
    )
    
    // Redirect to the Mastodon instance's OAuth page
    return sendRedirect(event, authUrl)
  } catch (error: any) {
    console.error('Mastodon login error:', error)
    return sendRedirect(event, `/signin?error=${encodeURIComponent(error.message)}`)
  }
})
