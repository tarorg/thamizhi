<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, Share, X } from 'lucide-vue-next'
import CommentPanel from '@/components/CommentPanel.vue'
import { useMastodon } from '@/composables/useMastodon'

const posts = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPost = ref(null)
const showComments = ref(false)
const comments = ref([])
const loadingComments = ref(false)
const { accessToken } = useMastodon()

const MASTODON_INSTANCE = 'mastodon.social'
const ACCOUNT_NAME = 'thamizhi'

// Format the date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ta-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Parse content to handle HTML
function parseContent(content: string) {
  const div = document.createElement('div')
  div.innerHTML = content
  return div.textContent || div.innerText || ''
}

// Check if media is video
function isVideo(media: any) {
  return media.type === 'video' || media.type === 'gifv'
}

// Check if media is image
function isImage(media: any) {
  return media.type === 'image'
}

// Fetch comments for a post
async function fetchComments(postId: string) {
  try {
    loadingComments.value = true
    const response = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/statuses/${postId}/context`
    )
    const data = await response.json()
    
    // First get the selected post details
    const postResponse = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/statuses/${postId}`
    )
    const postData = await postResponse.json()
    
    // Combine in chronological order: ancestors -> selected post -> descendants
    comments.value = [
      ...(data.ancestors || []),
      postData,
      ...(data.descendants || [])
    ]
  } catch (e) {
    console.error('Failed to load comments:', e)
  } finally {
    loadingComments.value = false
  }
}

// Fetch timeline data
async function fetchMastodonData() {
  try {
    loading.value = true
    const accountResponse = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/accounts/lookup?acct=${ACCOUNT_NAME}`
    )
    const accountData = await accountResponse.json()

    const timelineResponse = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/accounts/${accountData.id}/statuses?exclude_reblogs=false&exclude_replies=false`
    )
    const timelineData = await timelineResponse.json()
    posts.value = timelineData
  } catch (e) {
    error.value = 'Failed to load Mastodon data'
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Toggle comments view
async function toggleComments(post: any) {
  if (selectedPost.value?.id === post.id) {
    selectedPost.value = null
    showComments.value = false
    comments.value = []
    stopCommentPolling()
  } else {
    selectedPost.value = post
    showComments.value = true
    await fetchComments(post.id)
    startCommentPolling()
  }
}

async function handleReply(postId: string, content: string) {
  try {
    const response = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/statuses`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: content,
          in_reply_to_id: postId,
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to post comment')
    }

    // Refresh comments immediately after posting
    await fetchComments(postId)
    
    // Update the post's reply count in the main feed
    if (selectedPost.value) {
      selectedPost.value.replies_count++
    }
  } catch (e) {
    console.error('Failed to post comment:', e)
  }
}

let commentPollingInterval: NodeJS.Timeout | null = null

function startCommentPolling() {
  if (commentPollingInterval) return
  
  commentPollingInterval = setInterval(() => {
    if (selectedPost.value?.id) {
      fetchComments(selectedPost.value.id)
    }
  }, 10000)
}

function stopCommentPolling() {
  if (commentPollingInterval) {
    clearInterval(commentPollingInterval)
    commentPollingInterval = null
  }
}

onMounted(() => {
  fetchMastodonData()
})

onUnmounted(() => {
  stopCommentPolling()
})
</script>

<template>
  <div class="container mx-auto p-6 flex gap-6">
    <!-- Main Feed -->
    <div class="flex-1 max-w-2xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <p class="text-muted-foreground">Loading...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-10">
        <p class="text-destructive">{{ error }}</p>
        <Button class="mt-4" @click="fetchMastodonData">Retry</Button>
      </div>

      <!-- Posts Feed -->
      <div v-else class="space-y-4">
        <Card v-for="post in posts" :key="post.id" class="bg-card">
          <CardHeader>
            <div class="flex items-center gap-4">
              <Avatar>
                <AvatarImage :src="post.account.avatar" />
                <AvatarFallback>TH</AvatarFallback>
              </Avatar>
              <div class="flex-1">
                <CardTitle class="text-base text-card-foreground">{{ post.account.display_name }}</CardTitle>
                <span class="text-sm text-muted-foreground">@{{ post.account.acct }}</span>
              </div>
              <span class="text-sm text-muted-foreground">{{ formatDate(post.created_at) }}</span>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-foreground whitespace-pre-line">{{ parseContent(post.content) }}</p>
            
            <!-- Media Attachments -->
            <div v-if="post.media_attachments?.length" class="grid gap-2">
              <div 
                v-for="media in post.media_attachments" 
                :key="media.id"
                class="relative rounded-lg overflow-hidden"
              >
                <!-- Video Player -->
                <video
                  v-if="isVideo(media)"
                  controls
                  class="w-full max-h-[512px] bg-black"
                  :poster="media.preview_url"
                >
                  <source :src="media.url" :type="media.mime_type">
                  Your browser does not support the video tag.
                </video>

                <!-- Image -->
                <img 
                  v-if="isImage(media)"
                  :src="media.url"
                  :alt="media.description || ''"
                  class="w-full h-auto max-h-[512px] object-contain bg-black/5"
                  loading="lazy"
                />
              </div>
            </div>
            
            <!-- Interaction Buttons -->
            <div class="flex items-center gap-6 pt-2">
              <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-primary">
                <Heart class="w-5 h-5 mr-1" />
                <span>{{ post.favourites_count }}</span>
              </Button>
              <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-primary">
                <Repeat2 class="w-5 h-5 mr-1" />
                <span>{{ post.reblogs_count }}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                class="text-muted-foreground hover:text-primary"
                :class="{ 'bg-accent': selectedPost?.id === post.id }"
                @click="toggleComments(post)"
              >
                <MessageCircle class="w-5 h-5 mr-1" />
                <span>{{ post.replies_count }}</span>
              </Button>
              <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-primary ml-auto">
                <Share class="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Comments Deck -->
    <CommentPanel
      :selected-post="selectedPost"
      :comments="comments"
      :loading-comments="loadingComments"
      :show-comments="showComments"
      :access-token="accessToken"
      @close="toggleComments(selectedPost)"
      @reply="handleReply"
    />
  </div>
</template> 