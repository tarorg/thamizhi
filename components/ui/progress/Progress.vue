<script setup lang="ts">
defineProps<{
  value?: number
}>()
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-full bg-secondary h-2">
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    />
  </div>
</template>
