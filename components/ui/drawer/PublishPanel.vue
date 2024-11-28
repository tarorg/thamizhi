<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-vue-next'

interface ThreadOption {
  id: number
  thread: string
}

const props = defineProps<{
  open: boolean
  threads: ThreadOption[]
  selectedThread: string
}>()

const emit = defineEmits(['update:open', 'update:selectedThread'])

// Add loading state
const isThreadsLoading = computed(() => props.threads.length === 0)

// Add reactive state for form data
const formData = ref({
  slug: '',
  tags: '',
  status: 'draft',
  authors: '',
  publishDate: '',
  excerpt: ''
})
</script>

<template>
  <Sheet 
    :open="open" 
    @update:open="$emit('update:open', $event)" 
    side="right"
    :closeButton="false"
  >
    <SheetContent 
      class="w-[400px] sm:w-[540px]"
      :showClose="false"
    >
      <div class="flex flex-col h-full">
        <!-- Header with action buttons -->
        <SheetHeader class="border-b pb-4">
          <div class="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              @click="$emit('update:open', false)"
            >
              <ArrowLeftIcon class="h-4 w-4" />
            </Button>
            <Button size="sm">
              Publish
            </Button>
          </div>
        </SheetHeader>
        
        <!-- Tabs section -->
        <Tabs default-value="meta" class="mt-6 flex-1">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="meta">
              Meta
            </TabsTrigger>
            <TabsTrigger value="logs">
              Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="meta" class="mt-4">
            <div class="divide-y">
              <!-- Thread -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Thread</div>
                <div class="w-2/3">
                  <Select
                    :value="selectedThread"
                    @update:value="(value: string) => emit('update:selectedThread', value)"
                    :disabled="isThreadsLoading"
                  >
                    <SelectTrigger>
                      <SelectValue :placeholder="isThreadsLoading ? 'Loading threads...' : 'Select thread...'" />
                    </SelectTrigger>
                    <SelectContent>
                      <div v-if="isThreadsLoading" class="flex items-center justify-center p-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      </div>
                      <SelectItem
                        v-else
                        v-for="thread in threads"
                        :key="thread.id"
                        :value="thread.thread"
                      >
                        {{ thread.thread }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <!-- Slug -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Slug</div>
                <div class="w-2/3">
                  <input 
                    v-model="formData.slug"
                    type="text" 
                    class="w-full bg-transparent text-sm"
                    placeholder="Enter URL slug..."
                  />
                </div>
              </div>

              <!-- Tags -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Tags</div>
                <div class="w-2/3">
                  <input 
                    v-model="formData.tags"
                    type="text" 
                    class="w-full bg-transparent text-sm"
                    placeholder="Add tags..."
                  />
                </div>
              </div>

              <!-- Status -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Status</div>
                <div class="w-2/3">
                  <select 
                    v-model="formData.status"
                    class="w-full bg-transparent text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <!-- Authors -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Authors</div>
                <div class="w-2/3">
                  <input 
                    v-model="formData.authors"
                    type="text" 
                    class="w-full bg-transparent text-sm"
                    placeholder="Add authors..."
                  />
                </div>
              </div>

              <!-- Publish Date -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Publish Date</div>
                <div class="w-2/3">
                  <input 
                    v-model="formData.publishDate"
                    type="datetime-local" 
                    class="w-full bg-transparent text-sm"
                  />
                </div>
              </div>

              <!-- Excerpt -->
              <div class="flex py-4">
                <div class="w-1/3 text-sm text-muted-foreground">Excerpt</div>
                <div class="w-2/3">
                  <textarea 
                    v-model="formData.excerpt"
                    rows="3" 
                    class="w-full bg-transparent text-sm resize-none"
                    placeholder="Add a brief excerpt..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" class="mt-4">
            <div class="space-y-4">
              <div class="text-sm text-muted-foreground">
                Recent activity and changes
              </div>
              <div class="space-y-2">
                <!-- Example log entries -->
                <div class="p-3 bg-muted/5 rounded-md space-y-1">
                  <div class="text-sm font-medium">Draft created</div>
                  <div class="text-xs text-muted-foreground">Today at 10:00 AM</div>
                </div>
                <div class="p-3 bg-muted/5 rounded-md space-y-1">
                  <div class="text-sm font-medium">Title updated</div>
                  <div class="text-xs text-muted-foreground">Today at 9:45 AM</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
/* Input and select styles */
input, select, textarea {
  @apply outline-none border-none focus:ring-0;
}

/* Hover effect for rows */
.divide-y > div {
  @apply hover:bg-muted/5 -mx-6 px-6 transition-colors;
}
</style> 