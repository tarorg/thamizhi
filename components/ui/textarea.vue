<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <textarea
    :value="value"
    @input="value = ($event.target as HTMLTextAreaElement).value"
    class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="disabled"
    :placeholder="placeholder"
  />
</template> 