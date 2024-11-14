<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Ensure hydration matches server-rendered content
useHead({
  htmlAttrs: {
    lang: 'ta'
  }
})
</script>
