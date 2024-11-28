<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import PublishPanel from '@/components/ui/drawer/PublishPanel.vue'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { 
  NewspaperIcon, 
  HeadphonesIcon, 
  VideoIcon, 
  FileIcon,
  PlusIcon,
  FolderIcon
} from 'lucide-vue-next'
import FileUpload from '@/components/ui/upload/FileUpload.vue'

// Define the type for EditorJS data
interface EditorData {
  blocks: Array<{
    type: string
    data: any
  }>
}

// Update the interface to include file info
interface UploadResponse {
  url: string
  file: File
  type: string
  name: string
}

// Add these interfaces near the top with other interfaces
interface ThumbnailUploadResponse {
  url: string
  file: File
  type: string
  name: string
}

// Add this to your existing interfaces
interface ThreadOption {
  id: number
  thread: string
}

const post = ref({
  thumbnail: null as File | null,
  thumbnailUrl: '',
  title: '',
  type: 'post',
  thread: '',
  asset: null as File | null,
  content: {
    blocks: []
  } as EditorData
})

const editor = ref<any>(null)

// Add loading state ref
const isThreadsLoading = ref(true)

// Modify the fetchThreads function
const fetchThreads = async () => {
  try {
    isThreadsLoading.value = true
    
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
            sql: "SELECT DISTINCT thread FROM izhai WHERE thread IS NOT NULL ORDER BY thread",
            args: []
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch threads')
    }

    const result = await response.json()
    const rows = result?.results?.[0]?.response?.result?.rows || []
    
    threads.value = rows.map((row: any, index: number) => ({
      id: index + 1,
      thread: row[0]?.value || ''
    })).filter(thread => thread.thread) // Filter out empty threads
    
  } catch (error) {
    console.error('Error fetching threads:', error)
  } finally {
    isThreadsLoading.value = false
  }
}

// Modify onMounted to handle loading state
onMounted(async () => {
  if (process.client) {
    // Load threads first
    await fetchThreads()
    
    // Then initialize editor
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const Quote = (await import('@editorjs/quote')).default
    
    editor.value = new EditorJS({
      holder: 'editor',
      tools: {
        header: {
          class: Header as any,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2
          }
        },
        list: List,
        code: Code,
        quote: Quote
      },
      data: post.value.content,
      placeholder: 'Let\'s write something!'
    })
  }
})

// Clean up editor on component unmount
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

const mediaTypes = [
  { value: 'article', label: 'Article', icon: NewspaperIcon },
  { value: 'podcast', label: 'Podcast', icon: HeadphonesIcon, accept: 'audio/*' },
  { value: 'video', label: 'Video', icon: VideoIcon, accept: 'video/*' },
  { value: 'doc', label: 'Document', icon: FileIcon, accept: '.pdf,.doc,.docx' }
]

// Add this with other refs
const isUploading = ref(false)

// Replace the handleThumbnailUpload function with this new version
const handleThumbnailUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  
  isUploading.value = true
  try {
    // Create preview immediately for better UX
    post.value.thumbnailUrl = URL.createObjectURL(file)
    post.value.thumbnail = file
    
    const formData = new FormData()
    // Add timestamp to filename to prevent caching issues
    const timestamp = new Date().getTime()
    const fileName = `thumbnail-${timestamp}-${file.name}`
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
    post.value.thumbnailUrl = `https://pub-0f5bc537cc2f43028e30f936719213e7.r2.dev/${fileName}`
    
  } catch (err) {
    console.error('Thumbnail upload error:', err)
    // Reset on error
    post.value.thumbnail = null
    post.value.thumbnailUrl = ''
    // You might want to show an error message to the user here
  } finally {
    isUploading.value = false
  }
}

const handleAssetUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    post.value.asset = input.files[0]
  }
}

const handleSubmit = async () => {
  if (editor.value) {
    const savedData = await editor.value.save()
    post.value.content = savedData
  }
  console.log('Submitting post:', post.value)
}

const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const handleTypeSelect = (type: string) => {
  post.value.type = type
  if (type === 'article') {
    isSheetOpen.value = false
  }
}

const isSheetOpen = ref(false)

// Add new ref for preview URL
const previewUrl = ref('')

// Modify the upload complete handler
const handleUploadComplete = (response: UploadResponse) => {
  post.value.asset = response.file
  previewUrl.value = response.url
  
  // For debugging
  console.log('Upload complete:', {
    url: response.url,
    type: response.type,
    size: response.file.size,
    name: response.name
  })
  
  // Automatically close sheet after successful upload
  isSheetOpen.value = false
}

// Add these functions near other utility functions
const deleteFileFromR2 = async (fileName: string) => {
  try {
    const response = await fetch(`https://par.thamizhnationorg.workers.dev/${fileName}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete file from R2')
    }
    
    console.log('File deleted successfully:', fileName) // Add logging for debugging
    return true
  } catch (err) {
    console.error('Error deleting file from R2:', err)
    return false
  }
}

// Add this function to handle back button press
const handleBackPress = async () => {
  if (post.value.asset) {
    const confirmed = await window.confirm('Change the Type and Remove the file?')
    if (confirmed) {
      // Extract filename from the URL
      const fileName = previewUrl.value.split('/').pop()
      if (fileName) {
        await deleteFileFromR2(fileName)
      }
      
      // Reset state
      post.value.asset = null
      previewUrl.value = ''
      post.value.type = 'article'
    }
    return confirmed
  }
  
  // If no asset, just go back
  post.value.type = 'article'
  return true
}

// Add this function to handle file change
const handleFileChange = async () => {
  if (post.value.asset && previewUrl.value) {
    const confirmed = await window.confirm('Remove the current file?')
    if (confirmed) {
      // Extract filename from the URL
      const fileName = previewUrl.value.split('/').pop()
      if (fileName) {
        await deleteFileFromR2(fileName)
      }
      
      // Reset state
      post.value.asset = null
      previewUrl.value = ''
    }
  }
}

// Add these refs with your other refs
const threads = ref<ThreadOption[]>([])
const selectedThread = ref('')
</script>

<template>
  <div class="container mx-auto">
    <!-- Row layout with responsive changes -->
    <div class="grid lg:grid-cols-[50px_120px_1fr_50px] grid-cols-[50px_80px_1fr] bg-background border-b border-zinc-200">
      <!-- Cell 1: Square Thumbnail -->
      <div class="relative h-[50px] w-[50px] border-r border-zinc-200">
        <input
          type="file"
          accept="image/*"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          @change="handleThumbnailUpload"
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <div v-if="post.thumbnailUrl" class="w-full h-full">
            <img :src="post.thumbnailUrl" class="w-full h-full object-cover" />
            <div v-if="isUploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            </div>
          </div>
          <div v-else class="text-center">
            <PlusIcon class="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <!-- Cell 2: Media Type -->
      <div class="border-r border-zinc-200 h-[50px]">
        <Sheet v-model:open="isSheetOpen">
          <SheetTrigger class="w-full h-full px-3 flex items-center justify-center hover:bg-muted/5">
            <component 
              :is="mediaTypes.find(t => t.value === post.type)?.icon || NewspaperIcon"
              class="w-4 h-4"
            />
          </SheetTrigger>
          <SheetContent side="bottom" class="h-[400px]">
            <!-- First show all options -->
            <div v-if="!post.asset && !['podcast', 'video', 'doc'].includes(post.type)" class="flex flex-col divide-y">
              <button
                v-for="type in mediaTypes"
                :key="type.value"
                @click="handleTypeSelect(type.value)"
                class="flex items-center gap-3 p-4 hover:bg-muted/5 transition-colors"
                :class="{ 'bg-muted/10': post.type === type.value }"
              >
                <component :is="type.icon" class="w-5 h-5" />
                <span class="text-sm font-medium">{{ type.label }}</span>
              </button>
            </div>

            <!-- Show selected type and upload/preview for media types -->
            <div v-else-if="['podcast', 'video', 'doc'].includes(post.type)" class="flex flex-col gap-4 p-4">
              <!-- Selected Type Header -->
              <div class="flex items-center justify-between pb-4 border-b">
                <div class="flex items-center gap-3">
                  <button 
                    class="hover:bg-muted/5 p-2 rounded-full"
                    @click="handleBackPress"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                  <div class="flex items-center gap-2">
                    <component :is="mediaTypes.find(t => t.value === post.type)?.icon" class="w-5 h-5" />
                    <span class="text-sm font-medium">
                      {{ mediaTypes.find(t => t.value === post.type)?.label }}
                    </span>
                  </div>
                </div>
                
                <!-- Show file size if asset exists -->
                <span v-if="post.asset" class="text-xs text-muted-foreground">
                  {{ (post.asset.size / 1024 / 1024).toFixed(2) + ' MB' }}
                </span>
              </div>

              <div class="flex-1 flex flex-col gap-4">
                <!-- Upload Section when no asset -->
                <div v-if="!post.asset" class="flex-1">
                  <FileUpload 
                    :accept="mediaTypes.find(t => t.value === post.type)?.accept"
                    @upload-complete="handleUploadComplete"
                  />
                </div>

                <!-- Preview Section when asset exists -->
                <div v-else class="border rounded-lg p-4 bg-muted/5">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm font-medium">Preview</p>
                    <button 
                      @click="handleFileChange"
                      class="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Change file
                    </button>
                  </div>
                  
                  <!-- Audio Preview -->
                  <audio v-if="post.type === 'podcast'" 
                    controls 
                    class="w-full"
                    :src="previewUrl"
                    preload="metadata"
                    type="audio/mpeg"
                  >
                    <source :src="previewUrl" type="audio/mpeg">
                    <source :src="previewUrl" type="audio/mp3">
                    Your browser does not support the audio element.
                  </audio>

                  <!-- Video Preview -->
                  <video v-if="post.type === 'video'" 
                    controls 
                    class="w-full rounded-lg"
                    :src="previewUrl"
                    preload="metadata"
                    type="video/mp4"
                  >
                    <source :src="previewUrl" type="video/mp4">
                    <source :src="previewUrl" type="video/webm">
                    Your browser does not support the video element.
                  </video>

                  <!-- Document Preview -->
                  <div v-if="post.type === 'doc'" class="text-center text-sm text-muted-foreground">
                    <FileIcon class="w-8 h-8 mx-auto mb-2" />
                    Document uploaded
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <!-- Cell 3 (Mobile): Right Arrow with grey background -->
      <button 
        @click="toggleDrawer"
        class="lg:hidden flex h-[50px] items-center justify-center bg-muted/5 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      <!-- Cell 3 (Desktop): Title -->
      <div class="px-3 border-r border-zinc-200 lg:flex hidden items-center h-[50px]">
        <input
          v-model="post.title"
          type="text"
          class="w-full bg-transparent outline-none placeholder:text-muted-foreground text-lg font-bold"
          placeholder="Post title"
        />
      </div>

      <!-- Cell 4 (Desktop): Right Arrow -->
      <button 
        @click="toggleDrawer"
        class="lg:flex hidden h-[50px] w-[50px] items-center justify-center bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      <!-- Mobile Title Row -->
      <div class="lg:hidden col-span-3 h-[50px] px-3 border-t border-zinc-200 flex items-center">
        <input
          v-model="post.title"
          type="text"
          class="w-full bg-transparent outline-none placeholder:text-muted-foreground text-lg font-bold"
          placeholder="Post title"
        />
      </div>
    </div>

    <!-- Editor Section - Full width -->
    <div class="bg-background w-full">
      <div id="editor" class="min-h-[400px]" />
    </div>

    <!-- Settings Drawer -->
    <PublishPanel 
      v-model="isDrawerOpen" 
      :open="isDrawerOpen"
      :threads="threads"
      v-model:selected-thread="post.thread"
      @update:open="isDrawerOpen = $event"
    />
  </div>
</template>

<style>
/* Base editor styles */
.codex-editor {
  width: 100% !important;
  padding: 0 !important;
  position: relative !important;
}

.codex-editor__redactor {
  padding: 0 !important;
  margin: 0 !important;
  position: relative !important;
  margin-top: 2rem !important;
}

/* Content block styles */
.ce-block__content {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 80px !important; /* Add padding instead of margin for consistent spacing */
}

.ce-toolbar__content {
  max-width: 100% !important;
  padding: 0 80px !important;
}

/* Position plus button */
.ce-toolbar__plus {
  left: 20px !important;
  background: transparent !important;
}

/* Position settings button */
.ce-toolbar__settings-btn {
  right: auto !important;
  left: 20px !important;
  background: transparent !important;
}

/* Position toolbar actions */
.ce-toolbar__actions {
  right: auto !important;
  left: 20px !important;
  background: transparent !important;
}

/* Mobile adjustments */
@media (max-width: 1024px) {
  .ce-block__content,
  .ce-toolbar__content {
    padding: 0 20px !important;
  }

  .ce-toolbar__plus,
  .ce-toolbar__settings-btn,
  .ce-toolbar__actions {
    left: 10px !important;
  }
}

/* Container styles */
.container {
  @apply max-w-full px-0;
}

/* Input styles */
input:focus {
  outline: none;
  box-shadow: none;
}

/* Sheet content styles */
.sheet-content {
  @apply p-0;
}

/* Toolbar visibility */
.ce-toolbar {
  position: sticky !important;
  top: 0;
  background: var(--background);
  z-index: 20;
}

/* Block selected state */
.ce-block--selected .ce-block__content {
  background: transparent !important;
}

/* Toolbar button hover states */
.ce-toolbar__plus:hover,
.ce-toolbar__settings-btn:hover {
  background-color: var(--muted) !important;
}

/* Add these styles */
audio {
  height: 40px;
  width: 100%;
  outline: none;
}

video {
  max-height: 200px;
  width: 100%;
  object-fit: contain;
  background: black;
  outline: none;
}

/* Add custom audio player styles */
audio::-webkit-media-controls-panel {
  background-color: #f3f4f6;
}

audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-mute-button {
  background-color: #fff;
  border-radius: 50%;
}

/* Add custom video player styles */
video::-webkit-media-controls-panel {
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
}
</style> 