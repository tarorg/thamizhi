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
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
      >
        சேமி / Save
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
import { ChevronDownIcon } from 'lucide-vue-next'

definePageMeta({
  layout: 'default'
})

interface IzhaiForm {
  section: string
  collection: string
  thread: string
}

const form = ref<IzhaiForm>({
  section: '',
  collection: '',
  thread: ''
})

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

const handleSubmit = () => {
  console.log('Form submitted:', form.value)
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
</style> 