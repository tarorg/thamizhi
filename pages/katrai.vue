<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const collections = ref([
  {
    id: 1,
    title: 'தமிழ் இலக்கியம்',
    description: 'Classical Tamil Literature collection',
    posts: [
      { id: 1, title: 'திருக்குறள்' },
      { id: 2, title: 'சிலப்பதிகாரம்' },
    ],
  },
  // Add more collections...
])
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">கற்றல் - Collections</h1>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="collection in collections" :key="collection.id">
        <CardHeader>
          <CardTitle>{{ collection.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground mb-4">{{ collection.description }}</p>
          <ul class="space-y-2">
            <li v-for="post in collection.posts" :key="post.id" 
              class="text-sm hover:text-primary cursor-pointer">
              {{ post.title }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template> 