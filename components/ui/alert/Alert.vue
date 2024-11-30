<template>
  <div
    :class="[
      'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
      variant === 'destructive'
        ? 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
        : 'text-foreground'
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'destructive'
}>()
</script>
