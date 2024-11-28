<script setup lang="ts">
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  selectedPost: any
  comments: any[]
  loadingComments: boolean
  showComments: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

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
</script>

<template>
  <div 
    v-if="showComments && selectedPost" 
    class="w-[400px] hidden lg:block border-l h-screen fixed right-0 top-0 bg-background"
  >
    <div class="flex flex-col h-full">
      <!-- Comments Header -->
      <div class="p-4 border-b bg-background">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Comments</h2>
          <Button variant="ghost" size="icon" @click="emit('close')">
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
</template> 