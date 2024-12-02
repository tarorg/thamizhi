import { generateAuthUrl } from '~/utils/mastodon'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { instance, handle } = query

    if (!instance || !handle) {
      throw new Error('Missing required parameters')
    }

    // Generate OAuth URL for the specific instance
    const authUrl = await generateAuthUrl(instance.toString(), handle.toString())
    
    // Redirect to the Mastodon instance's OAuth page
    return sendRedirect(event, authUrl)
  } catch (error: any) {
    console.error('Mastodon login error:', error)
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: error.message || 'Failed to initiate Mastodon login'
    }))
  }
})
