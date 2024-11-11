<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <Sheet 
    :open="modelValue" 
    @update:open="$emit('update:modelValue', $event)" 
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
              @click="$emit('update:modelValue', false)"
            >
              <ArrowLeftIcon class="h-4 w-4" />
            </Button>
            <div class="flex gap-2">
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
              <Button size="sm">
                Publish
              </Button>
            </div>
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
          
          <TabsContent value="meta" class="mt-4 space-y-4">
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Description</label>
                <textarea 
                  rows="3" 
                  class="w-full p-2 bg-muted/5 rounded-md resize-none"
                  placeholder="Add a description..."
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Tags</label>
                <input 
                  type="text" 
                  class="w-full p-2 bg-muted/5 rounded-md"
                  placeholder="Add tags..."
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Status</label>
                <select class="w-full p-2 bg-muted/5 rounded-md">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
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
.sheet-content {
  @apply p-6;
}

/* Target the parent sheet container */
:deep(.fixed) > button,
:deep(.sheet-overlay) + button {
  display: none !important;
}
</style> 