<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <Sheet :open="modelValue" @update:open="$emit('update:modelValue', $event)" side="right">
    <SheetContent class="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Post Settings</SheetTitle>
      </SheetHeader>
      
      <Tabs default-value="meta" class="mt-6">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="meta">Meta Information</TabsTrigger>
          <TabsTrigger value="settings">
            <IconStar class="w-4 h-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="meta" class="mt-4">
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
          </div>
        </TabsContent>
        
        <TabsContent value="settings" class="mt-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Visibility</label>
              <select class="w-full p-2 bg-muted/5 rounded-md">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </SheetContent>
  </Sheet>
</template> 