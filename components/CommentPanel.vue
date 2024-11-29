<script setup lang="ts">
import { ref } from 'vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area/index'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea/index'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  selectedPost: any
  comments: any[]
  loadingComments: boolean
  showComments: boolean
  accessToken: string | null
}>()

const emit = defineEmits(['close', 'reply'])

const replyContent = ref('')

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ta-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function handleReply() {
  if (!props.selectedPost?.id || !replyContent.value.trim()) return
  
  emit('reply', props.selectedPost.id, replyContent.value)
  replyContent.value = ''
}
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <!-- Desktop Header - hidden on mobile -->
    <div class="flex items-center justify-between p-4 border-b hidden md:flex">
      <h2 class="text-lg font-semibold">Comments</h2>
      <Button 
        variant="ghost" 
        size="icon"
        @click="$emit('close')"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Comments List -->
    <ScrollArea class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        <!-- Loading State -->
        <div v-if="loadingComments" class="text-center py-4">
          <p class="text-muted-foreground">Loading comments...</p>
        </div>

        <!-- Comments -->
        <div v-else-if="comments.length > 0" class="space-y-4">
          <div 
            v-for="comment in comments" 
            :key="comment.id"
            class="flex gap-4"
          >
            <Avatar class="w-8 h-8">
              <AvatarImage :src="comment.account.avatar" />
              <AvatarFallback>{{ comment.account.display_name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ comment.account.display_name }}</span>
                <span class="text-sm text-muted-foreground">@{{ comment.account.acct }}</span>
                <span class="text-sm text-muted-foreground">·</span>
                <span class="text-sm text-muted-foreground">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="text-sm">{{ comment.content.replace(/<[^>]*>/g, '') }}</p>
            </div>
          </div>
        </div>

        <!-- No Comments -->
        <div v-else class="text-center py-4">
          <p class="text-muted-foreground">No comments yet</p>
        </div>
      </div>
    </ScrollArea>

    <!-- Reply Input - Fixed at bottom -->
    <div class="border-t bg-background p-4 sticky bottom-0">
      <div class="space-y-2">
        <Textarea
          v-model="replyContent"
          placeholder="Write a comment..."
          class="resize-none min-h-[80px]"
          :rows="3"
        />
        <div class="flex justify-end">
          <Button 
            size="sm"
            :disabled="!replyContent.trim()"
            @click="handleReply"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-1 {
  min-height: 0;
  /* Add max height to ensure scrolling works with fixed input */
  max-height: calc(100vh - 140px); /* Adjust based on header and input heights */
}

@media (min-width: 768px) {
  .flex-1 {
    max-height: calc(100vh - 180px);
  }
}

:deep(p) {
  margin: 0;
}
</style> 