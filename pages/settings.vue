<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>
    
    <div class="space-y-6">
      <!-- Account Settings -->
      <div class="bg-card rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Account</h2>
        <div class="space-y-4">
          <div v-if="mastodonUser">
            <div class="flex items-center space-x-4">
              <img 
                :src="mastodonUser.avatar" 
                :alt="mastodonUser.display_name"
                class="w-12 h-12 rounded-full"
              />
              <div>
                <div class="font-medium">{{ mastodonUser.display_name }}</div>
                <div class="text-sm text-muted-foreground">@{{ mastodonUser.username }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Appearance Settings -->
      <div class="bg-card rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Appearance</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>Theme</span>
            <Button @click="toggleTheme" variant="outline" class="w-32">
              {{ isDark ? 'Dark' : 'Light' }} Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useMastodon } from '@/composables/useMastodon'
import { ref } from 'vue'

const { mastodonUser } = useMastodon()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}
</script>
