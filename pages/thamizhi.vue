<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SendIcon, RefreshCw } from 'lucide-vue-next'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

// Add your API key to .env file
const GEMINI_API_KEY = ref(localStorage.getItem('gemini_api_key') || '')
const API_URL = computed(() => 
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY.value}`
)

// Add API key validation
const isApiKeySet = computed(() => Boolean(GEMINI_API_KEY.value))

const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  }
])

const newMessage = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Add typing animation state
const isTyping = ref(false)
const typingDots = ref('')

// Update the typing dots animation
const startTypingAnimation = () => {
  isTyping.value = true
  let count = 0
  const interval = setInterval(() => {
    typingDots.value = '.'.repeat((count % 4))
    count++
  }, 500)
  
  return () => {
    clearInterval(interval)
    isTyping.value = false
    typingDots.value = ''
  }
}

// Update sendMessage function
async function sendMessage() {
  if (!newMessage.value.trim() || isLoading.value) return
  
  if (!isApiKeySet.value) {
    error.value = 'Please set your Gemini API key in Settings'
    return
  }
  
  // Add user message
  const userMessage = newMessage.value
  messages.value.push({
    role: 'user',
    content: userMessage,
  })
  
  // Clear input and start loading
  newMessage.value = ''
  isLoading.value = true
  error.value = null
  
  // Add temporary loading message
  messages.value.push({
    role: 'assistant',
    content: '',
  })
  
  // Start typing animation
  const stopTyping = startTypingAnimation()

  try {
    const response = await fetch(API_URL.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userMessage
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get response')
    }

    const data = await response.json()
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.'

    // Replace loading message with actual response
    messages.value[messages.value.length - 1].content = aiResponse

  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to get response. Please try again.'
    // Remove loading message on error
    messages.value.pop()
  } finally {
    isLoading.value = false
    stopTyping()
  }
}

// Add retry functionality
function retryLastMessage() {
  if (messages.value.length < 2) return
  
  // Remove last assistant message if exists
  if (messages.value[messages.value.length - 1].role === 'assistant') {
    messages.value.pop()
  }
  
  // Get last user message
  const lastUserMessage = messages.value[messages.value.length - 1].content
  newMessage.value = lastUserMessage
  messages.value.pop()
  sendMessage()
}

// Handle textarea height
const textarea = ref<HTMLTextAreaElement | null>(null)

function adjustTextareaHeight() {
  if (!textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

// Handle enter key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-60px)] md:h-screen">
    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-4 pb-4 max-w-3xl mx-auto">
        <Card 
          v-for="(message, i) in messages" 
          :key="i" 
          :class="[
            'transition-all',
            message.role === 'assistant' 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-primary text-primary-foreground'
          ]"
        >
          <CardContent class="p-4">
            <div class="whitespace-pre-wrap">
              {{ message.content }}
              <!-- Show typing animation for empty assistant messages -->
              <span 
                v-if="isTyping && message.role === 'assistant' && !message.content"
                class="inline-flex items-center"
              >
                <span class="typing-dots">{{ typingDots }}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Error Message -->
        <Card v-if="error" class="bg-destructive text-destructive-foreground">
          <CardContent class="p-4 flex items-center justify-between">
            <span>{{ error }}</span>
            <Button 
              variant="secondary" 
              size="sm"
              @click="retryLastMessage"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Input Area - Fixed at bottom -->
    <div class="border-t bg-background p-4">
      <div class="flex gap-2 max-w-3xl mx-auto">
        <textarea 
          ref="textarea"
          v-model="newMessage"
          class="flex-1 rounded-md border p-2 text-foreground bg-background resize-none max-h-[200px] min-h-[44px]"
          placeholder="Type your message..."
          rows="1"
          @input="adjustTextareaHeight"
          @keydown="handleKeydown"
          :disabled="isLoading"
        />
        <Button 
          @click="sendMessage"
          :disabled="isLoading || !newMessage.trim()"
          class="self-end"
        >
          <SendIcon v-if="!isLoading" class="w-4 h-4" />
          <RefreshCw v-else class="w-4 h-4 animate-spin" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.overflow-y-auto:hover {
  scrollbar-color: var(--scrollbar) transparent;
}

.overflow-y-auto:hover::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar);
  border-radius: 3px;
}

:root {
  --scrollbar: rgb(200, 200, 200);
}

.dark {
  --scrollbar: rgb(50, 50, 50);
}

.typing-dots {
  display: inline-block;
  min-width: 20px;
  font-family: monospace;
}

/* Disable textarea when loading */
textarea:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 