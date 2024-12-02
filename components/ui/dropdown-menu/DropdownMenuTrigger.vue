<script setup lang="ts">
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  asChild?: boolean
}>()
</script>

<template>
  <DropdownMenuTrigger
    :as-child="asChild"
    :class="
      cn(
        'flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        $attrs.class as string
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </DropdownMenuTrigger>
</template>
