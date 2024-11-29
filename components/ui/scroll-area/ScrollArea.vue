<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <ScrollAreaRoot
    :class="cn('relative overflow-hidden', props.class)"
  >
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="flex touch-none select-none transition-colors h-2.5 flex-col border-l border-l-transparent p-[1px]"
      orientation="vertical"
    >
      <ScrollAreaThumb 
        class="relative flex-1 rounded-full bg-border" 
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template> 