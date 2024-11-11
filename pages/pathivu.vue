<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const post = ref({
  title: '',
  content: '',
  description: ''
})

const handleSubmit = () => {
  // Handle post submission
  console.log('Submitting post:', post.value)
}

const handleBack = () => {
  navigateTo('/katrai')
}
</script>

<template>
  <div class="container mx-auto p-6">
    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="title" class="text-sm font-medium">Title</label>
            <input
              id="title"
              v-model="post.title"
              type="text"
              class="w-full p-2 border rounded-md bg-background"
              placeholder="Enter post title"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium">Description</label>
            <input
              id="description"
              v-model="post.description"
              type="text"
              class="w-full p-2 border rounded-md bg-background"
              placeholder="Enter short description"
            />
          </div>

          <div class="space-y-2">
            <label for="content" class="text-sm font-medium">Content</label>
            <textarea
              id="content"
              v-model="post.content"
              rows="10"
              class="w-full p-2 border rounded-md bg-background"
              placeholder="Write your post content here..."
            />
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="handleBack"
              class="px-4 py-2 text-sm border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create Post
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template> 