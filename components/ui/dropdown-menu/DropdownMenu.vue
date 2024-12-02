<script setup lang="ts">
import { DropdownMenuRoot } from 'radix-vue'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <DropdownMenuRoot v-bind="$attrs">
    <slot />
  </DropdownMenuRoot>
</template>
