export function useMastodon() {
  const mastodonToken = ref(localStorage.getItem('mastodon_token'))
  const mastodonInstance = ref('mastodon.social')

  const isAuthenticated = computed(() => Boolean(mastodonToken.value))

  // Like a post
  const likePost = async (id: string) => {
    if (!mastodonToken.value) return
    
    return fetch(`https://${mastodonInstance.value}/api/v1/statuses/${id}/favourite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mastodonToken.value}`
      }
    })
  }

  // Reshare a post
  const resharePost = async (id: string) => {
    if (!mastodonToken.value) return
    
    return fetch(`https://${mastodonInstance.value}/api/v1/statuses/${id}/reblog`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mastodonToken.value}`
      }
    })
  }

  // Add comment
  const addComment = async (id: string, comment: string) => {
    if (!mastodonToken.value) return
    
    return fetch(`https://${mastodonInstance.value}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mastodonToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: comment,
        in_reply_to_id: id
      })
    })
  }

  return {
    isAuthenticated,
    likePost,
    resharePost,
    addComment
  }
} 