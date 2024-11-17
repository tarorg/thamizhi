<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { GlobeIcon } from 'lucide-vue-next'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

// Language state
const currentLanguage = ref('ta') // 'ta' for Tamil (default)

const languages = [
  { value: 'ta', label: 'தமிழ்' },
  { value: 'en', label: 'English' }
]

const handleLanguageChange = (value: string) => {
  currentLanguage.value = value
  // You can emit an event or handle language change logic here
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <!-- Main Menu Items -->
    <ul
      data-sidebar="menu"
      :class="cn('flex w-full min-w-0 flex-col gap-1', props.class)"
    >
      <slot />
    </ul>

    <!-- Spacer to push content to bottom -->
    <div class="flex-1"></div>

    <!-- Language Selector -->
    <div class="px-2 mb-2">
      <Select v-model="currentLanguage" @update:modelValue="handleLanguageChange">
        <SelectTrigger class="w-full h-9">
          <div class="flex items-center gap-2">
            <GlobeIcon class="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            v-for="lang in languages" 
            :key="lang.value" 
            :value="lang.value"
          >
            {{ lang.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Theme Toggle -->
    <slot name="bottom" />
  </div>
</template>

<style scoped>
/* Custom styles for the language selector */
:deep(.select-trigger) {
  @apply bg-background border-muted-foreground/20;
}

:deep(.select-trigger:hover) {
  @apply bg-muted;
}

:deep(.select-content) {
  @apply bg-background border-muted-foreground/20;
}
</style>
