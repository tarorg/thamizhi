<script setup lang="ts">
import { Sidebar, SidebarContent, SidebarProvider, SidebarMenu, SidebarMenuButton, SidebarHeader } from '@/components/ui/sidebar'
import { Home, MessageSquare, BookOpen } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <h2 class="text-lg font-semibold">தமிழ்</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton 
            as="nuxt-link" 
            to="/alai"
            :is-active="route.path === '/alai'"
            tooltip="அலை"
          >
            <Home />
            <span>அலை</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            as="nuxt-link" 
            to="/thamizhi"
            :is-active="route.path === '/thamizhi'"
            tooltip="தமிழி"
          >
            <MessageSquare />
            <span>தமிழி</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            as="nuxt-link" 
            to="/katrai"
            :is-active="route.path === '/katrai'"
            tooltip="கற்றல்"
          >
            <BookOpen />
            <span>கற்றல்</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </SidebarProvider>
</template> 