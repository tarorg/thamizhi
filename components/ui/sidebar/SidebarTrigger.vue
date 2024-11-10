<script setup lang="ts">
import { useSidebar } from './utils'
import { Asterisk } from 'lucide-vue-next'

const { toggleSidebar, state } = useSidebar()
</script>

<template>
  <SidebarHeader>
    <div 
      class="flex items-center cursor-pointer hover:text-primary transition-colors"
      @click="toggleSidebar"
    >
      <div :class="[
        'text-foreground flex items-center justify-center',
        state === 'expanded' ? 'h-8 w-8' : 'h-8 w-8'
      ]">
        <Asterisk class="h-6 w-6" />
      </div>
      <h2 
        class="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden"
      >
        தமிழி
      </h2>
    </div>
  </SidebarHeader>
</template>
