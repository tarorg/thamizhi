<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, Share, X } from 'lucide-vue-next'
import CommentPanel from '@/components/CommentPanel.vue'
import { useMastodon } from '@/composables/useMastodon'

// Add interfaces for type safety
interface MastodonPost {
  id: string
  content: string
  created_at: string
  account: {
    avatar: string
    display_name: string
    acct: string
  }
  media_attachments: Array<{
    id: string
    type: string
    url: string
    preview_url: string
    mime_type: string
    description: string | null
  }>
  favourites_count: number
  reblogs_count: number
  replies_count: number
}

// Update refs with proper types
const posts = ref<MastodonPost[]>([])
const selectedPost = ref<MastodonPost | null>(null)
const comments = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showComments = ref(false)
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
    if (!response.ok) throw new Error('Failed to fetch comments')
    
    const data = await response.json()
    
    // Get the selected post details
    const postResponse = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/statuses/${postId}`
    )
    if (!postResponse.ok) throw new Error('Failed to fetch post details')
    
    const postData = await postResponse.json()
    
    // Combine in chronological order
    comments.value = [
      ...(data.ancestors || []),
      postData,
      ...(data.descendants || [])
    ]
  } catch (e) {
    console.error('Failed to load comments:', e)
    comments.value = [] // Reset comments on error
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
    if (!accountResponse.ok) throw new Error('Failed to fetch account')
    
    const accountData = await accountResponse.json()

    const timelineResponse = await fetch(
      `https://${MASTODON_INSTANCE}/api/v1/accounts/${accountData.id}/statuses?exclude_reblogs=false&exclude_replies=false`
    )
    if (!timelineResponse.ok) throw new Error('Failed to fetch timeline')
    
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
async function toggleComments(post: MastodonPost | null) {
  if (!post) return

  if (selectedPost.value?.id === post.id) {
    selectedPost.value = null
    showComments.value = false
    comments.value = []
    stopCommentPolling()
    document.body.classList.remove('comments-open')
  } else {
    selectedPost.value = post
    showComments.value = true
    await fetchComments(post.id)
    startCommentPolling()
    document.body.classList.add('comments-open')
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
  document.body.classList.remove('comments-open')
})
</script>

<template>
  <div class="container mx-auto p-6 h-screen overflow-hidden">
    <div class="flex flex-col md:flex-row gap-6 h-full">
      <!-- Main Feed -->
      <div class="flex-1 max-w-2xl overflow-y-auto">
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
        <div v-else class="space-y-4 pb-6">
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

      <!-- Comments Panel - Mobile Optimized -->
      <Transition name="slide">
        <div 
          v-if="showComments" 
          class="fixed inset-0 z-50 md:sticky md:top-0 md:inset-auto bg-background md:w-[400px] md:border-l border-border md:h-screen comments-panel"
        >
          <!-- Mobile Header -->
          <div class="flex items-center justify-between p-4 border-b md:hidden">
            <h2 class="text-lg font-semibold">Comments</h2>
            <Button 
              variant="ghost" 
              size="icon"
              @click="selectedPost && toggleComments(selectedPost)"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>

          <!-- Comments Content -->
          <div class="h-[calc(100%-60px)] md:h-full">
            <CommentPanel
              :selected-post="selectedPost"
              :comments="comments"
              :loading-comments="loadingComments"
              :show-comments="showComments"
              :access-token="accessToken"
              @close="selectedPost && toggleComments(selectedPost)"
              @reply="handleReply"
              class="h-full"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Modern Scrollbar Styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  padding-right: 0.5rem;
}

/* For Webkit browsers (Chrome, Safari) */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--border));
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--muted-foreground));
}

/* Hide scrollbar when not hovering */
.overflow-y-auto:not(:hover)::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.overflow-y-auto:not(:hover) {
  scrollbar-color: transparent transparent;
}

/* Mobile styles */
@media (max-width: 768px) {
  .container {
    padding-left: 0;
    padding-right: 0;
  }
  
  .overflow-y-auto {
    padding-left: 1.5rem;
    padding-right: calc(1.5rem + 4px); /* Account for scrollbar width */
  }
}

/* Prevent body scroll when comments are open on mobile */
:global(body.comments-open) {
  @apply overflow-hidden md:overflow-auto;
}

/* Comments Panel Positioning */
.comments-panel {
  margin-right: var(--sidebar-offset, 0);
  height: 100vh; /* Full viewport height */
}

/* Adjust panel position when sidebar is collapsed */
:deep([data-state="collapsed"]) ~ .container .comments-panel {
  margin-right: var(--sidebar-width-icon);
}

/* Adjust panel position when sidebar is expanded */
:deep([data-state="expanded"]) ~ .container .comments-panel {
  margin-right: var(--sidebar-width);
}

/* Container adjustments */
.container {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  height: 100vh;
}

/* Mobile styles */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }
  
  .comments-panel {
    margin-right: 0;
    height: 100%;
  }
}
</style> 