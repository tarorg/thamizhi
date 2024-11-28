<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, Send } from 'lucide-vue-next'
import Textarea from '@/components/ui/textarea.vue'
import { useMastodon } from '@/composables/useMastodon'

const props = defineProps<{
  selectedPost: any
  comments: any[]
  loadingComments: boolean
  showComments: boolean
}>()

const { accessToken, validateToken } = useMastodon()
const isTokenValid = ref(true)

const emit = defineEmits<{
  'close': []
  'reply': [postId: string, content: string]
}>()

const newComment = ref('')
const isSubmitting = ref(false)
const commentsContainer = ref<HTMLElement | null>(null)

// Handle comment submission
async function handleSubmit() {
  if (!newComment.value.trim() || !props.selectedPost?.id) return
  
  try {
    isSubmitting.value = true
    // Validate token before submitting
    isTokenValid.value = await validateToken()
    if (!isTokenValid.value) {
      throw new Error('Invalid token')
    }
    
    await emit('reply', props.selectedPost.id, newComment.value)
    newComment.value = '' // Clear input after successful submission
  } catch (e) {
    console.error('Failed to post comment:', e)
    if (!isTokenValid.value) {
      // Handle invalid token - maybe show a message to reconnect
    }
  } finally {
    isSubmitting.value = false
  }
}

// Validate token when component mounts
onMounted(async () => {
  if (accessToken.value) {
    isTokenValid.value = await validateToken()
  }
})

// Format the date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // If less than 24 hours, show hours ago
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h`
  }
  
  // If less than 7 days, show days ago
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}d`
  }
  
  // Otherwise show date
  return date.toLocaleDateString('ta-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

// Parse content to handle HTML
function parseContent(content: string) {
  const div = document.createElement('div')
  div.innerHTML = content
  return div.textContent || div.innerText || ''
}
</script>

<template>
  <div 
    v-if="showComments && selectedPost" 
    class="w-[400px] hidden lg:block border-l h-screen fixed right-0 top-0 bg-background flex flex-col"
  >
    <!-- Header -->
    <div class="p-4 border-b bg-background sticky top-0 z-10">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Comments</h2>
        <Button variant="ghost" size="icon" @click="emit('close')">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Comments List -->
    <div 
      ref="commentsContainer"
      class="flex-1 overflow-y-auto"
    >
      <!-- Loading State -->
      <div v-if="loadingComments" class="text-center py-4">
        <p class="text-muted-foreground">Loading comments...</p>
      </div>

      <!-- Comments -->
      <div v-else-if="comments.length" class="divide-y">
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="p-4 flex gap-3"
        >
          <Avatar class="w-8 h-8 flex-shrink-0">
            <AvatarImage :src="comment.account.avatar" />
            <AvatarFallback>{{ comment.account.display_name.charAt(0) }}</AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="font-medium text-sm truncate">
                {{ comment.account.display_name }}
              </span>
              <span class="text-xs text-muted-foreground flex-shrink-0">
                {{ formatDate(comment.created_at) }}
              </span>
            </div>
            <p class="text-sm mt-0.5 break-words">
              {{ parseContent(comment.content) }}
            </p>
          </div>
        </div>
      </div>

      <!-- No Comments State -->
      <div v-else class="text-center py-4">
        <p class="text-muted-foreground">No comments yet</p>
      </div>
    </div>

    <!-- Comment Input -->
    <div 
      v-if="accessToken && isTokenValid" 
      class="border-t bg-background p-3 sticky bottom-0 left-0 right-0"
    >
      <div class="flex gap-2 items-end">
        <Textarea
          v-model="newComment"
          placeholder="Add a comment..."
          class="resize-none min-h-[44px] max-h-[120px] py-3"
          :disabled="isSubmitting"
        />
        <Button 
          size="sm"
          variant="ghost"
          class="h-[44px]"
          :disabled="!newComment.trim() || isSubmitting"
          @click="handleSubmit"
        >
          <Send class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Token Invalid Message -->
    <div 
      v-else-if="accessToken && !isTokenValid"
      class="border-t bg-background p-3 text-center"
    >
      <p class="text-sm text-destructive">Session expired. Please reconnect your Mastodon account.</p>
      <Button 
        variant="outline" 
        size="sm" 
        class="mt-2"
        @click="() => window.location.href = '/settings'"
      >
        Reconnect
      </Button>
    </div>
  </div>
</template> 