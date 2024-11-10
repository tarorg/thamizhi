<script setup lang="ts">
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarTrigger,
  SidebarFooter 
} from '@/components/ui/sidebar'
import { Asterisk, Globe, Library, MessageSquare, Sun, Moon } from 'lucide-vue-next'
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()

// Initialize theme state from localStorage or default to false (light mode)
const isDark = ref(false)

onMounted(() => {
  // Remove dark class on initial load to ensure light mode
  document.documentElement.classList.remove('dark')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" class="border-r bg-background">
      <SidebarTrigger>
        <Asterisk class="h-6 w-6" />
      </SidebarTrigger>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton 
            @click="navigate('/alai')"
            :is-active="route.path === '/alai'"
            tooltip="அலை"
            class="text-foreground"
          >
            <Globe class="text-foreground" />
            <span>அலை</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/thamizhi')"
            :is-active="route.path === '/thamizhi'"
            tooltip="தமிழி"
            class="text-foreground"
          >
            <MessageSquare class="text-foreground" />
            <span>தமிழி</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/katrai')"
            :is-active="route.path === '/katrai'"
            tooltip="கற்றை"
            class="text-foreground"
          >
            <Library class="text-foreground" />
            <span>கற்றை</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuButton 
          @click="toggleTheme"
          tooltip="Toggle Theme"
          class="text-foreground"
        >
          <Sun v-if="!isDark" class="text-foreground" />
          <Moon v-else class="text-foreground" />
          <span>{{ isDark ? 'Dark' : 'Light' }} Mode</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>

    <main class="flex-1 overflow-hidden bg-background">
      <slot />
    </main>
  </SidebarProvider>
</template> 