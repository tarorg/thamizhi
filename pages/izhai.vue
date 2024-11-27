<template>
  <div class="container mx-auto py-8 px-4 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">இழை / Thread</h1>
        <p class="text-sm text-muted-foreground">Create new thread for your collection</p>
      </div>
      <button 
        @click="handleSubmit"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'சேமி / Save' }}
      </button>
    </div>

    <!-- Notion-like Table Form -->
    <div class="border rounded-lg overflow-hidden bg-background">
      <!-- Table Header -->
      <div class="border-b px-6 py-3 bg-muted/30">
        <h2 class="font-medium">Thread Details</h2>
      </div>

      <!-- Form Fields -->
      <div class="divide-y">
        <!-- Thumbnail Field -->
        <div class="flex items-center p-4 hover:bg-muted/5 transition-colors">
          <div class="w-1/3 flex items-center gap-2">
            <span class="text-sm font-medium">படம்</span>
            <span class="text-xs text-muted-foreground">/</span>
            <span class="text-sm text-muted-foreground">Thumbnail</span>
          </div>
          <div class="flex-1">
            <!-- Show this when there's no image -->
            <Tabs v-if="!form.thumbnailUrl" v-model="activeTab" class="w-full">
              <TabsList class="mb-4">
                <TabsTrigger value="upload" class="flex items-center gap-2">
                  <UploadIcon class="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" class="flex items-center gap-2">
                  <LinkIcon class="w-4 h-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div class="relative h-[100px] w-[100px] border rounded-lg overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="handleThumbnailUpload"
                  />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div v-if="form.thumbnailUrl" class="w-full h-full">
                      <img 
                        :src="form.thumbnailUrl" 
                        class="w-full h-full object-cover"
                        alt="Thumbnail preview" 
                      />
                      <div 
                        v-if="isUploading" 
                        class="absolute inset-0 bg-black/50 flex items-center justify-center"
                      >
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      </div>
                    </div>
                    <div v-else class="text-center">
                      <PlusIcon class="w-6 h-6 text-muted-foreground" />
                      <span class="text-xs text-muted-foreground mt-1">Upload Image</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url">
                <div class="space-y-4">
                  <div class="flex gap-2">
                    <Input
                      v-model="imageUrl"
                      type="url"
                      placeholder="Enter image URL..."
                      class="flex-1"
                    />
                    <button 
                      @click="handleImageUrl"
                      class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      :disabled="!imageUrl"
                    >
                      Add
                    </button>
                  </div>
                  
                  <!-- URL Image Preview -->
                  <div 
                    v-if="form.thumbnailUrl && activeTab === 'url'" 
                    class="relative h-[100px] w-[100px] border rounded-lg overflow-hidden"
                  >
                    <img 
                      :src="form.thumbnailUrl" 
                      class="w-full h-full object-cover"
                      alt="URL thumbnail preview" 
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <!-- Show this when there's an image -->
            <div 
              v-else 
              class="relative h-[100px] w-[100px] border rounded-lg overflow-hidden group"
            >
              <img 
                :src="form.thumbnailUrl" 
                class="w-full h-full object-cover"
                alt="Thumbnail preview" 
              />
              
              <!-- Remove button overlay on hover -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  @click="removeThumbnail"
                  class="p-1.5 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
                >
                  <XIcon class="w-4 h-4 text-white" />
                </button>
              </div>

              <!-- Loading overlay -->
              <div 
                v-if="isUploading" 
                class="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Field -->
        <div class="flex items-center p-4 hover:bg-muted/5 transition-colors">
          <div class="w-1/3 flex items-center gap-2">
            <span class="text-sm font-medium">வகை</span>
            <span class="text-xs text-muted-foreground">/</span>
            <span class="text-sm text-muted-foreground">Section</span>
          </div>
          <div class="flex-1">
            <Select v-model="form.section">
              <SelectTrigger class="w-full border-none shadow-none focus:ring-0 hover:bg-muted/5">
                <SelectValue placeholder="Select a section..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="section in sections" 
                  :key="section.value" 
                  :value="section.value"
                >
                  <span class="flex items-center gap-2">
                    <span>{{ section.label.ta }}</span>
                    <span class="text-muted-foreground">{{ section.label.en }}</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Collection Field -->
        <div class="flex items-center p-4 hover:bg-muted/5 transition-colors">
          <div class="w-1/3 flex items-center gap-2">
            <span class="text-sm font-medium">கற்றை</span>
            <span class="text-xs text-muted-foreground">/</span>
            <span class="text-sm text-muted-foreground">Collection</span>
          </div>
          <div class="flex-1">
            <Select v-model="form.collection">
              <SelectTrigger class="w-full border-none shadow-none focus:ring-0 hover:bg-muted/5">
                <SelectValue placeholder="Select a collection..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="collection in collections" 
                  :key="collection.value" 
                  :value="collection.value"
                >
                  <span class="flex items-center gap-2">
                    <span>{{ collection.label.ta }}</span>
                    <span class="text-muted-foreground">{{ collection.label.en }}</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Thread Field -->
        <div class="flex items-center p-4 hover:bg-muted/5 transition-colors">
          <div class="w-1/3 flex items-center gap-2">
            <span class="text-sm font-medium">இழை</span>
            <span class="text-xs text-muted-foreground">/</span>
            <span class="text-sm text-muted-foreground">Thread</span>
          </div>
          <div class="flex-1">
            <Input
              v-model="form.thread"
              type="text"
              class="border-none shadow-none focus:ring-0 hover:bg-muted/5"
              placeholder="Enter thread name..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add error message display -->
    <div 
      v-if="error" 
      class="text-red-500 text-sm mt-2"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronDownIcon, PlusIcon, ImageIcon, UploadIcon, LinkIcon, XIcon } from 'lucide-vue-next'

definePageMeta({
  layout: 'default'
})

interface IzhaiForm {
  thumbnail: File | null
  thumbnailUrl: string
  section: string
  collection: string
  thread: string
}

const form = ref<IzhaiForm>({
  thumbnail: null,
  thumbnailUrl: '',
  section: '',
  collection: '',
  thread: ''
})

// Add isUploading state
const isUploading = ref(false)

// Add thumbnail upload handler
const handleThumbnailUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  
  isUploading.value = true
  try {
    // Create preview immediately for better UX
    form.value.thumbnailUrl = URL.createObjectURL(file)
    form.value.thumbnail = file
    
    const formData = new FormData()
    // Add timestamp to filename to prevent caching issues
    const timestamp = new Date().getTime()
    const fileName = `izhai-thumbnail-${timestamp}-${file.name}`
    formData.append('name', fileName)
    formData.append('file', file)

    const response = await fetch('https://par.thamizhnationorg.workers.dev/upload', {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || 'Thumbnail upload failed')
    }
    
    await response.json()
    
    // Update the thumbnail URL to use the R2 URL
    form.value.thumbnailUrl = `https://pub-0f5bc537cc2f43028e30f936719213e7.r2.dev/${fileName}`
    
  } catch (err) {
    console.error('Thumbnail upload error:', err)
    // Reset on error
    form.value.thumbnail = null
    form.value.thumbnailUrl = ''
    // You might want to show an error message to the user here
  } finally {
    isUploading.value = false
  }
}

// Add new ref for image URL input
const imageUrl = ref('')

// Add method to handle URL image
const handleImageUrl = async () => {
  if (!imageUrl.value) return
  
  isUploading.value = true
  try {
    // Update form with the URL
    form.value.thumbnailUrl = imageUrl.value
    form.value.thumbnail = null // Since it's a URL, not a file
    
  } catch (err) {
    console.error('Image URL error:', err)
    form.value.thumbnailUrl = ''
    // Handle error
  } finally {
    isUploading.value = false
    imageUrl.value = '' // Reset input
  }
}

// Add active tab state
const activeTab = ref('upload')

// Bilingual data for dropdowns
const sections = [
  { value: 'literature', label: { ta: 'இலக்கியம்', en: 'Literature' } },
  { value: 'history', label: { ta: 'வரலாறு', en: 'History' } },
  { value: 'culture', label: { ta: 'பண்பாடு', en: 'Culture' } },
  { value: 'science', label: { ta: 'அறிவியல்', en: 'Science' } }
]

const collections = [
  { value: 'sangam', label: { ta: 'சங்க இலக்கியம்', en: 'Sangam Literature' } },
  { value: 'bhakti', label: { ta: 'பக்தி இலக்கியம்', en: 'Bhakti Literature' } },
  { value: 'modern', label: { ta: 'நவீன இலக்கியம்', en: 'Modern Literature' } }
]

const isLoading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = null

  try {
    // Validate required fields
    if (!form.value.section || !form.value.collection || !form.value.thread) {
      throw new Error('Please fill in all required fields')
    }

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
            sql: `INSERT INTO izhai (thumbnail, section, collection, thread, createdat, updatedat) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
              { type: "text", value: form.value.thumbnailUrl || '' },
              { type: "text", value: form.value.section },
              { type: "text", value: form.value.collection },
              { type: "text", value: form.value.thread },
              { type: "text", value: new Date().toISOString() },
              { type: "text", value: new Date().toISOString() }
            ]
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error(`Failed to save thread: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    // Success - redirect to threads list
    navigateTo('/threads')

  } catch (err) {
    console.error('Failed to save thread:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save thread'
  } finally {
    isLoading.value = false
  }
}

// Add new method for removing thumbnail
const removeThumbnail = () => {
  form.value.thumbnail = null
  form.value.thumbnailUrl = ''
  activeTab.value = 'upload' // Reset to upload tab
}
</script>

<style scoped>
:deep(.select-trigger) {
  @apply bg-transparent;
}

:deep(.select-content) {
  @apply border-zinc-200;
}

/* Remove default input styles */
input {
  @apply bg-transparent;
}

input:focus {
  @apply outline-none ring-0;
}

/* Custom hover states */
.hover-highlight:hover {
  @apply bg-muted/5;
}

/* Add thumbnail specific styles */
.thumbnail-upload {
  @apply relative border-2 border-dashed border-muted-foreground/20 rounded-lg 
         hover:border-muted-foreground/40 transition-colors;
}

.thumbnail-upload:hover .upload-overlay {
  @apply opacity-100;
}

.upload-overlay {
  @apply absolute inset-0 bg-black/50 opacity-0 transition-opacity
         flex flex-col items-center justify-center text-white;
}

/* Add tab specific styles */
:deep(.tabs-list) {
  @apply inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground;
}

:deep(.tabs-trigger) {
  @apply inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow;
}

:deep(.tabs-content) {
  @apply mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .hover\:bg-black\/75:hover {
  background-color: rgba(0, 0, 0, 0.75);
}
</style> 