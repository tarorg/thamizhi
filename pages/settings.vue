<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-vue-next'

const geminiKey = ref(localStorage.getItem('gemini_api_key') || '')
const isLoading = ref(false)

// Save API key
const saveApiKey = () => {
  isLoading.value = true
  try {
    localStorage.setItem('gemini_api_key', geminiKey.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container max-w-3xl mx-auto p-4">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-8">
      <Settings class="w-5 h-5" />
      <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <!-- Settings Table -->
    <div class="border rounded-lg divide-y">
      <!-- Gemini API Key -->
      <div class="p-4">
        <div class="grid grid-cols-3 gap-4 items-center">
          <div class="col-span-1">
            <label class="text-sm font-medium">Gemini API Key</label>
          </div>
          <div class="col-span-2 flex gap-2">
            <Input
              v-model="geminiKey"
              type="password"
              placeholder="Enter API key"
            />
            <Button 
              @click="saveApiKey"
              :disabled="isLoading"
              size="default"
            >
              {{ isLoading ? 'Saving...' : 'Save' }}
            </Button>
          </div>
        </div>
        <div class="mt-2">
          <p class="text-sm text-muted-foreground">
            Get your API key from 
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank"
              class="text-primary hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 60px);
}
</style> 