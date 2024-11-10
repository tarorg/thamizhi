<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const messages = ref([
  {
    role: 'assistant',
    content: 'வணக்கம்!',
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
  <div class="flex flex-col h-[calc(100vh-60px)] md:h-screen">
    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-4 pb-4">
        <Card v-for="(message, i) in messages" :key="i" 
          :class="[
            message.role === 'assistant' 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-primary text-primary-foreground'
          ]">
          <CardContent class="p-4">
            {{ message.content }}
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Input Area - Fixed at bottom -->
    <div class="border-t bg-background p-4 w-full">
      <div class="flex gap-2 max-w-[95%] mx-auto">
        <textarea 
          v-model="newMessage"
          class="flex-1 rounded-md border p-2 text-foreground bg-background resize-none"
          placeholder="Type your message..."
          rows="1"
          @keydown.enter.prevent="sendMessage"
        />
        <Button @click="sendMessage">Send</Button>
      </div>
    </div>
  </div>
</template> 