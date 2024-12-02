<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-end">
      <Button 
        @click="logout"
        variant="ghost"
        class="text-sm text-muted-foreground hover:text-foreground"
      >
        Sign Out
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useMastodon } from '@/composables/useMastodon'

const { logout } = useMastodon()
</script>