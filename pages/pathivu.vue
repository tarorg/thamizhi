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

const post = ref({
  thumbnail: null as File | null,
  thumbnailUrl: '',
  title: '',
  type: 'post',
  asset: null as File | null,
  content: {
    blocks: []
  } as EditorData
})

const editor = ref<any>(null)

// Initialize EditorJS only on client-side
onMounted(async () => {
  if (process.client) {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const Quote = (await import('@editorjs/quote')).default
    
    editor.value = new EditorJS({
      holder: 'editor',
      tools: {
        header: {
          class: Header,
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
  { value: 'doc', label: 'Document', icon: FileIcon, accept: '.pdf,.doc,.docx' },
  { value: 'collection', label: 'Sub Collection', icon: FolderIcon }
]

const handleThumbnailUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    post.value.thumbnail = input.files[0]
    post.value.thumbnailUrl = URL.createObjectURL(input.files[0])
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
  if (['article', 'collection'].includes(type)) {
    isSheetOpen.value = false
  }
}

const isSheetOpen = ref(false)
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
            <div v-if="!['podcast', 'video', 'doc'].includes(post.type)" class="flex flex-col divide-y">
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

            <!-- Show selected type and upload for media types -->
            <div v-else class="flex flex-col gap-4 p-4">
              <!-- Selected Type Header -->
              <div class="flex items-center gap-3 pb-4 border-b">
                <button 
                  class="hover:bg-muted/5 p-2 rounded-full"
                  @click="post.type = 'article'"
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

              <!-- Upload Section -->
              <div class="flex-1">
                <FileUpload 
                  :accept="mediaTypes.find(t => t.value === post.type)?.accept"
                  @upload-complete="(url) => { post.asset = url; isSheetOpen = false; }"
                />
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
</style> 