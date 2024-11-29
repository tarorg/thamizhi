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
import { useSidebar } from './utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { state } = useSidebar()
const currentLanguage = ref('TA')
const languages = [
  { value: 'TA', label: 'TA' },
  { value: 'EN', label: 'EN' }
]

const handleLanguageChange = (value: string) => {
  currentLanguage.value = value
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <!-- Main Menu Items -->
    <ul
      data-sidebar="menu"
      :class="cn('flex w-full min-w-0 flex-col gap-1 px-2', props.class)"
    >
      <slot />
    </ul>

    <!-- Spacer to push content to bottom -->
    <div class="flex-1"></div>

    <!-- Language Selector -->
    <div class="px-2">
      <Select v-model="currentLanguage" @update:modelValue="handleLanguageChange">
        <SelectTrigger 
          class="w-full h-5 bg-transparent border-0 text-xs" 
          :class="{ 'justify-center [&>svg]:hidden': state === 'collapsed' }"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            v-for="lang in languages" 
            :key="lang.value" 
            :value="lang.value"
            class="text-xs"
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
:deep(.select-trigger) {
  @apply hover:bg-transparent py-0;
}

:deep(.select-content) {
  @apply bg-background border-muted-foreground/20;
}
</style>
