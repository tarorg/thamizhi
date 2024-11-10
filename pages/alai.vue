<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// Mock mastodon feed data
const posts = ref([
  {
    id: 1,
    content: 'Sample mastodon post content...',
    author: 'தமிழி',
    timestamp: '2h ago',
  },
  // Add more posts...
])
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-foreground">அலை - Mastodon Feed</h1>
    
    <div class="space-y-4">
      <Card v-for="post in posts" :key="post.id" class="bg-card">
        <CardHeader>
          <div class="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/avatar-placeholder.jpg" />
              <AvatarFallback>TH</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle class="text-lg text-card-foreground">{{ post.author }}</CardTitle>
              <span class="text-sm text-muted-foreground">{{ post.timestamp }}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-foreground">{{ post.content }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template> 