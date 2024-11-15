<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { Progress } from '@/components/ui/progress'
import { FileIcon, ImageIcon, VideoIcon, HeadphonesIcon, XIcon } from 'lucide-vue-next'

const props = defineProps<{
  accept?: string
}>()

const emit = defineEmits(['upload-complete'])

const file = ref<File | null>(null)
const preview = ref<string | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const error = ref<string | null>(null)

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon
  if (type.startsWith('video/')) return VideoIcon
  if (type.startsWith('audio/')) return HeadphonesIcon
  return FileIcon
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  file.value = input.files[0]
  
  // Create preview for images
  if (file.value.type.startsWith('image/')) {
    preview.value = URL.createObjectURL(file.value)
  }
  
  try {
    isUploading.value = true
    error.value = null
    
    const formData = new FormData()
    // Add timestamp to filename to prevent caching issues
    const timestamp = new Date().getTime()
    const fileName = `${timestamp}-${file.value.name}`
    formData.append('name', fileName)
    formData.append('file', file.value)

    const response = await fetch('https://par.thamizhnationorg.workers.dev/upload', {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || 'Upload failed')
    }
    
    const data = await response.json()
    
    // Remove the URL verification since it causes CORS issues
    const fileUrl = `https://pub-0f5bc537cc2f43028e30f936719213e7.r2.dev/${fileName}` // Use the fileName we sent

    emit('upload-complete', {
      url: fileUrl,
      file: file.value,
      type: file.value.type,
      name: fileName // Add filename to the response
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
    console.error('Upload error:', err)
  } finally {
    isUploading.value = false
  }
}

const clearFile = () => {
  file.value = null
  preview.value = null
  uploadProgress.value = 0
  error.value = null
}
</script>

<template>
  <div class="w-full">
    <div 
      class="border-2 border-dashed border-muted rounded-lg p-4 hover:border-primary transition-colors"
      :class="{ 'border-destructive': error }"
    >
      <input
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
        ref="fileInput"
      />
      
      <!-- Upload State -->
      <div v-if="!file" class="text-center cursor-pointer" @click="$refs.fileInput.click()">
        <div class="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto mb-2">
          <component :is="getFileIcon('file')" class="w-6 h-6 text-muted-foreground" />
        </div>
        <p class="text-sm text-muted-foreground">
          Click to upload or drag and drop
        </p>
      </div>

      <!-- Preview State -->
      <div v-else class="relative">
        <!-- Preview Image/Icon -->
        <div class="mb-2">
          <img 
            v-if="preview" 
            :src="preview" 
            class="max-h-48 rounded-lg mx-auto"
          />
          <div v-else class="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto">
            <component :is="getFileIcon(file.type)" class="w-6 h-6 text-muted-foreground" />
          </div>
        </div>

        <!-- File Info -->
        <div class="text-center">
          <p class="text-sm font-medium truncate">{{ file.name }}</p>
          <p class="text-xs text-muted-foreground">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
        </div>

        <!-- Progress Bar -->
        <div v-if="isUploading" class="mt-4">
          <Progress :value="uploadProgress" class="w-full" />
          <p class="text-xs text-center mt-1 text-muted-foreground">
            {{ uploadProgress }}%
          </p>
        </div>

        <!-- Error Message -->
        <p v-if="error" class="text-sm text-destructive text-center mt-2">
          {{ error }}
        </p>

        <!-- Clear Button -->
        <button 
          @click="clearFile"
          class="absolute top-0 right-0 p-1 rounded-full bg-background/80 hover:bg-background"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template> 