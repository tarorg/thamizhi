<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Add tabs data
const tabs = ref([
  { id: 'collections', label: 'Collections' },
  { id: 'posts', label: 'Posts' },
  { id: 'readLater', label: 'Read Later' }
])

const activeTab = ref('collections')

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

// Sample data for other tabs (you can replace with real data)
const posts = ref([
  { id: 1, title: 'Recent Post 1', description: 'Description 1' },
  { id: 2, title: 'Recent Post 2', description: 'Description 2' },
])

const readLater = ref([
  { id: 1, title: 'Saved Post 1', description: 'Description 1' },
  { id: 2, title: 'Saved Post 2', description: 'Description 2' },
])

const handleAddNew = () => {
  navigateTo('/pathivu')
}
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Tabs Navigation -->
    <div class="border-b mb-6">
      <nav class="flex justify-between items-center" aria-label="Tabs">
        <div class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'pb-4 px-1 font-medium text-sm',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <button 
          @click="handleAddNew"
          class="rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <span class="text-xl">+</span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'collections'" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="collection in collections" :key="collection.id" class="bg-card">
        <CardHeader>
          <CardTitle class="text-card-foreground">{{ collection.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground mb-4">{{ collection.description }}</p>
          <ul class="space-y-2">
            <li
              v-for="post in collection.posts"
              :key="post.id"
              class="text-sm hover:text-primary cursor-pointer text-foreground"
            >
              {{ post.title }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <!-- Posts Tab -->
    <div v-else-if="activeTab === 'posts'" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="post in posts" :key="post.id" class="bg-card">
        <CardHeader>
          <CardTitle class="text-card-foreground">{{ post.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">{{ post.description }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Read Later Tab -->
    <div v-else-if="activeTab === 'readLater'" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="post in readLater" :key="post.id" class="bg-card">
        <CardHeader>
          <CardTitle class="text-card-foreground">{{ post.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">{{ post.description }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template> 