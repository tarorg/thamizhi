<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed } from 'vue'

interface TextareaProps {
  modelValue?: string
  class?: string
  rows?: number
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<TextareaProps>(), {
  class: '',
  rows: 3
})

const emit = defineEmits(['update:modelValue'])

const textareaClass = computed(() => {
  return cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
})
</script>

<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :class="textareaClass"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
  >
    <slot />
  </textarea>
</template> 