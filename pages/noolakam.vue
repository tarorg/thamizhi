<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Play, Clock, BookmarkIcon } from 'lucide-vue-next'

// Add interface for izhai data
interface IzhaiItem {
  id: number
  thumbnail: string
  section: string
  collection: string
  thread: string
  createdat: string
  updatedat: string
}

// Add tabs data
const tabs = ref([
  { id: 'collections', label: 'Collections' },
  { id: 'sections', label: 'Sections' },
  { id: 'recent', label: 'Recent' }
])

const activeTab = ref('collections')
const items = ref<IzhaiItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch data from Turso
const fetchIzhaiData = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT * FROM izhai ORDER BY createdat DESC",
            args: []
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Raw API response:', result)

    // Extract rows from the response
    const rows = result?.results?.[0]?.response?.result?.rows || []
    
    // Map the rows to our IzhaiItem interface
    items.value = rows.map((row: any) => ({
      id: row[0]?.value,
      thumbnail: row[1]?.value,
      section: row[2]?.value,
      collection: row[3]?.value,
      thread: row[4]?.value,
      createdat: row[5]?.value,
      updatedat: row[6]?.value
    }))

    console.log('Parsed items:', items.value)

  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = 'Failed to load content'
  } finally {
    isLoading.value = false
  }
}

// Computed properties first
const groupedByCollection = computed(() => {
  const groups: { [key: string]: IzhaiItem[] } = {}
  items.value.forEach(item => {
    if (!groups[item.collection]) {
      groups[item.collection] = []
    }
    groups[item.collection].push(item)
  })
  return groups
})

const groupedBySection = computed(() => {
  const groups: { [key: string]: IzhaiItem[] } = {}
  items.value.forEach(item => {
    if (!groups[item.section]) {
      groups[item.section] = []
    }
    groups[item.section].push(item)
  })
  return groups
})

const recentItems = computed(() => {
  return [...items.value].sort((a, b) => 
    new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
  ).slice(0, 10)
})

// Watchers after computed properties
watch(items, (newItems) => {
  console.log('Items updated:', newItems)
})

watch(groupedByCollection, (groups) => {
  console.log('Grouped by collection:', groups)
})

// Fetch data on mount
onMounted(() => {
  fetchIzhaiData()
})
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
      </div>
    </div>

    <div class="px-6 py-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Collections Tab -->
        <div v-if="activeTab === 'collections'" class="space-y-8">
          <div v-for="(items, collection) in groupedByCollection" :key="collection">
            <h2 class="text-2xl font-bold mb-4">{{ collection }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="group relative overflow-hidden rounded-lg cursor-pointer"
              >
                <img 
                  :src="item.thumbnail" 
                  :alt="item.thread"
                  class="h-64 w-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/75"></div>
                <div class="absolute bottom-0 p-4 w-full">
                  <h3 class="text-xl font-bold text-white mb-1">{{ item.thread }}</h3>
                  <p class="text-sm text-white/80">{{ item.section }}</p>
                  <p class="text-sm text-white/60 mt-1">
                    {{ new Date(item.createdat).toLocaleDateString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sections Tab -->
        <div v-else-if="activeTab === 'sections'" class="space-y-8">
          <div v-for="(items, section) in groupedBySection" :key="section">
            <h2 class="text-2xl font-bold mb-4">{{ section }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="group bg-card hover:bg-card/80 rounded-md p-4 transition-colors cursor-pointer"
              >
                <div class="relative mb-4">
                  <img 
                    :src="item.thumbnail" 
                    :alt="item.thread"
                    class="aspect-square w-full object-cover rounded-md"
                  />
                </div>
                <h3 class="font-semibold mb-1 text-foreground">{{ item.thread }}</h3>
                <p class="text-sm text-muted-foreground">{{ item.collection }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Tab -->
        <div v-else-if="activeTab === 'recent'" class="space-y-6">
          <h2 class="text-2xl font-bold mb-4">Recent Threads</h2>
          <div class="grid gap-6">
            <div 
              v-for="item in recentItems" 
              :key="item.id"
              class="group bg-card hover:bg-card/80 rounded-lg p-6 transition-colors cursor-pointer"
            >
              <div class="flex gap-6">
                <img 
                  :src="item.thumbnail" 
                  :alt="item.thread"
                  class="w-48 h-48 object-cover rounded-md"
                />
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ item.thread }}</h3>
                  <p class="text-muted-foreground mb-4">{{ item.collection }}</p>
                  <div class="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{{ item.section }}</span>
                    <span>•</span>
                    <span>{{ new Date(item.createdat).toLocaleDateString() }}</span>
                  </div>
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