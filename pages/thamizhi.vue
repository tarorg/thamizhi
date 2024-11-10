<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const messages = ref([
  {
    role: 'assistant',
    content: 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  },
  // Add more messages...
])

const newMessage = ref('')

function sendMessage() {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    role: 'user',
    content: newMessage.value,
  })
  
  newMessage.value = ''
  // Add API call logic here
}
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-4">
        <Card v-for="(message, i) in messages" :key="i" 
          :class="[
            message.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
          ]">
          <CardContent class="p-4">
            {{ message.content }}
          </CardContent>
        </Card>
      </div>
    </div>

    <div class="border-t p-4">
      <div class="flex gap-2">
        <textarea 
          v-model="newMessage"
          class="flex-1 rounded-md border p-2"
          placeholder="Type your message..."
          rows="1"
          @keydown.enter.prevent="sendMessage"
        />
        <Button @click="sendMessage">Send</Button>
      </div>
    </div>
  </div>
</template> 