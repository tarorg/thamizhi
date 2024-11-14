<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, Share, X } from 'lucide-vue-next'

const posts = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPost = ref(null)
const showComments = ref(false)
const comments = ref([])
const loadingComments = ref(false)

const MASTODON_INSTANCE = 'mastodon.social'
const ACCOUNT_NAME = 'thamizhi'

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
    comments.value = data.descendants || []
  } catch (e) {
    console.error('Failed to load comments:', e)
  } finally {
    loadingComments.value = false
  }
}

// Toggle comments view
async function toggleComments(post: any) {
  if (selectedPost.value?.id === post.id) {
    selectedPost.value = null
    showComments.value = false
    comments.value = []
  } else {
    selectedPost.value = post
    showComments.value = true
    await fetchComments(post.id)
  }
}

onMounted(() => {
  fetchMastodonData()
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
    <div 
      v-if="showComments && selectedPost" 
      class="w-[400px] hidden lg:block border-l h-screen fixed right-0 top-0 bg-background"
    >
      <div class="flex flex-col h-full">
        <!-- Comments Header -->
        <div class="p-4 border-b bg-background">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Comments</h2>
            <Button variant="ghost" size="icon" @click="toggleComments(selectedPost)">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Original Post -->
          <Card class="bg-card">
            <CardHeader>
              <div class="flex items-center gap-3">
                <Avatar class="w-8 h-8">
                  <AvatarImage :src="selectedPost.account.avatar" />
                  <AvatarFallback>TH</AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-sm font-medium">{{ selectedPost.account.display_name }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(selectedPost.created_at) }}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-foreground">{{ parseContent(selectedPost.content) }}</p>
            </CardContent>
          </Card>

          <!-- Comments Loading State -->
          <div v-if="loadingComments" class="text-center py-4">
            <p class="text-muted-foreground">Loading comments...</p>
          </div>

          <!-- Comments List -->
          <div v-else-if="comments.length" class="space-y-4">
            <Card v-for="comment in comments" :key="comment.id" class="bg-card">
              <CardHeader>
                <div class="flex items-center gap-3">
                  <Avatar class="w-8 h-8">
                    <AvatarImage :src="comment.account.avatar" />
                    <AvatarFallback>{{ comment.account.display_name.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="text-sm font-medium">{{ comment.account.display_name }}</p>
                    <p class="text-xs text-muted-foreground">{{ formatDate(comment.created_at) }}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-foreground">{{ parseContent(comment.content) }}</p>
                
                <!-- Comment Media -->
                <div v-if="comment.media_attachments?.length" class="mt-2">
                  <div 
                    v-for="media in comment.media_attachments" 
                    :key="media.id"
                    class="relative rounded-lg overflow-hidden mt-2"
                  >
                    <video
                      v-if="isVideo(media)"
                      controls
                      class="w-full max-h-[256px] bg-black"
                      :poster="media.preview_url"
                    >
                      <source :src="media.url" :type="media.mime_type">
                    </video>

                    <img 
                      v-if="isImage(media)"
                      :src="media.url"
                      :alt="media.description || ''"
                      class="w-full h-auto max-h-[256px] object-contain bg-black/5"
                      loading="lazy"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- No Comments State -->
          <div v-else class="text-center py-4">
            <p class="text-muted-foreground">No comments yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 