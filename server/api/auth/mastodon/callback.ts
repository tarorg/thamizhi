export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { code, state } = query

    if (!code) {
      throw new Error('No authorization code received')
    }

    // TODO: Exchange the authorization code for an access token
    // This will be implemented in the next step

    // For now, redirect to home page
    return sendRedirect(event, '/')
  } catch (error: any) {
    console.error('Mastodon callback error:', error)
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: error.message || 'Failed to complete authentication'
    }))
  }
})
