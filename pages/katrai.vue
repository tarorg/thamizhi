<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Play, Clock, BookmarkIcon, PlusIcon } from 'lucide-vue-next'

// Add tabs data
const tabs = ref([
  { id: 'collections', label: 'Collections' },
  { id: 'posts', label: 'Posts' },
  { id: 'readLater', label: 'Read Later' }
])

const activeTab = ref('collections')

// Featured collections with cover images
const featuredCollections = ref([
  {
    id: 1,
    title: 'தமிழ் இலக்கியம்',
    description: 'Classical Tamil Literature collection',
    coverImage: 'https://images.pexels.com/photos/2099266/pexels-photo-2099266.jpeg',
    color: 'from-purple-700',
    postCount: 45
  },
  {
    id: 2,
    title: 'சங்க இலக்கியம்',
    description: 'Sangam Literature',
    coverImage: 'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg',
    color: 'from-green-700',
    postCount: 32
  },
  {
    id: 3,
    title: 'நவீன இலக்கியம்',
    description: 'Modern Tamil Literature',
    coverImage: 'https://images.pexels.com/photos/3747463/pexels-photo-3747463.jpeg',
    color: 'from-blue-700',
    postCount: 28
  },
])

// Recent collections
const recentCollections = ref([
  {
    id: 4,
    title: 'காப்பியங்கள்',
    description: 'Epic Poetry Collection',
    coverImage: 'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg',
    color: 'from-red-700',
    postCount: 15
  },
  {
    id: 5,
    title: 'பக்தி இலக்கியம்',
    description: 'Devotional Literature',
    coverImage: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
    color: 'from-orange-700',
    postCount: 23
  },
  {
    id: 6,
    title: 'சிறுகதைகள்',
    description: 'Short Stories Collection',
    coverImage: 'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg',
    color: 'from-teal-700',
    postCount: 18
  },
])

// Recent posts
const recentPosts = ref([
  {
    id: 1,
    title: 'திருக்குறள் - அன்பு அதிகாரம்',
    excerpt: 'அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு என்புதோல் போர்த்த உடம்பு',
    author: 'திருவள்ளுவர்',
    date: '2024-03-15',
    readTime: '5 min',
    coverImage: 'https://images.pexels.com/photos/3747463/pexels-photo-3747463.jpeg'
  },
  {
    id: 2,
    title: 'சிலப்பதிகாரம் - மாதவி',
    excerpt: 'கண்ணகி கதை - முதல் அத்தியாயம்',
    author: 'இளங்கோவடிகள்',
    date: '2024-03-14',
    readTime: '10 min',
    coverImage: 'https://images.pexels.com/photos/2099266/pexels-photo-2099266.jpeg'
  }
])

// Read Later items
const readLaterItems = ref([
  {
    id: 1,
    title: 'புறநானூறு - வீரம்',
    excerpt: 'யானை புலிக்கு அஞ்சும்',
    author: 'கணியன் பூங்குன்றனார்',
    savedDate: '2024-03-10',
    readTime: '7 min',
    coverImage: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg'
  },
  {
    id: 2,
    title: 'கம்பராமாயணம் - சுந்தரகாண்டம்',
    excerpt: 'அனுமன் இலங்கை செல்லுதல்',
    author: 'கம்பர்',
    savedDate: '2024-03-12',
    readTime: '15 min',
    coverImage: 'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg'
  }
])

const handleAddNew = () => {
  navigateTo('/pathivu')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex items-center gap-4 p-4">
        <div class="flex gap-2">
          <button class="rounded-full bg-background/90 p-2">
            <ChevronLeft class="h-4 w-4" />
          </button>
          <button class="rounded-full bg-background/90 p-2">
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-6">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="text-sm font-medium transition-colors"
            :class="activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="ml-auto">
          <button 
            @click="handleAddNew"
            class="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="px-6 py-4">
      <!-- Collections Tab -->
      <div v-if="activeTab === 'collections'">
        <!-- Featured Section -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Featured Collections</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="collection in featuredCollections" 
              :key="collection.id"
              class="group relative overflow-hidden rounded-lg cursor-pointer"
            >
              <div class="absolute inset-0 bg-gradient-to-b" :class="[collection.color, 'to-background/90']" />
              <img 
                :src="collection.coverImage" 
                :alt="collection.title"
                class="h-64 w-full object-cover transition-all duration-300 group-hover:scale-105"
              />
              <div class="absolute bottom-0 p-4 w-full">
                <h3 class="text-xl font-bold text-white mb-1">{{ collection.title }}</h3>
                <p class="text-sm text-white/80">{{ collection.description }}</p>
                <p class="text-sm text-white/60 mt-1">{{ collection.postCount }} posts</p>
              </div>
              <button 
                class="absolute right-4 bottom-4 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg 
                       flex items-center justify-center opacity-0 translate-y-2 transition-all duration-300 
                       group-hover:opacity-100 group-hover:translate-y-0"
              >
                <Play class="h-6 w-6" />
              </button>
            </div>
          </div>
        </section>

        <!-- Recent Collections -->
        <section>
          <h2 class="text-2xl font-bold mb-4">Recent Collections</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div 
              v-for="collection in recentCollections" 
              :key="collection.id"
              class="group bg-card hover:bg-card/80 rounded-md p-4 transition-colors cursor-pointer"
            >
              <div class="relative mb-4">
                <img 
                  :src="collection.coverImage" 
                  :alt="collection.title"
                  class="aspect-square w-full object-cover rounded-md"
                />
                <button 
                  class="absolute right-2 bottom-2 h-10 w-10 rounded-full bg-primary text-primary-foreground 
                         shadow-lg flex items-center justify-center opacity-0 translate-y-2 transition-all 
                         duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <Play class="h-5 w-5" />
                </button>
              </div>
              <h3 class="font-semibold mb-1 text-foreground">{{ collection.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ collection.description }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Posts Tab -->
      <div v-else-if="activeTab === 'posts'" class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">Recent Posts</h2>
        <div class="grid gap-6">
          <div 
            v-for="post in recentPosts" 
            :key="post.id"
            class="group bg-card hover:bg-card/80 rounded-lg p-6 transition-colors cursor-pointer"
          >
            <div class="flex gap-6">
              <img 
                :src="post.coverImage" 
                :alt="post.title"
                class="w-48 h-48 object-cover rounded-md"
              />
              <div class="flex-1">
                <h3 class="text-xl font-bold mb-2">{{ post.title }}</h3>
                <p class="text-muted-foreground mb-4">{{ post.excerpt }}</p>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{{ post.author }}</span>
                  <span>•</span>
                  <span>{{ post.date }}</span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <Clock class="w-4 h-4" />
                    {{ post.readTime }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Read Later Tab -->
      <div v-else-if="activeTab === 'readLater'" class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">Saved for Later</h2>
        <div class="grid gap-6">
          <div 
            v-for="item in readLaterItems" 
            :key="item.id"
            class="group bg-card hover:bg-card/80 rounded-lg p-6 transition-colors cursor-pointer"
          >
            <div class="flex gap-6">
              <img 
                :src="item.coverImage" 
                :alt="item.title"
                class="w-48 h-48 object-cover rounded-md"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-bold">{{ item.title }}</h3>
                  <button class="text-primary hover:text-primary/80">
                    <BookmarkIcon class="w-5 h-5" />
                  </button>
                </div>
                <p class="text-muted-foreground mb-4">{{ item.excerpt }}</p>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{{ item.author }}</span>
                  <span>•</span>
                  <span>Saved on {{ item.savedDate }}</span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <Clock class="w-4 h-4" />
                    {{ item.readTime }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-card {
  background-color: hsl(var(--card));
}
</style> 