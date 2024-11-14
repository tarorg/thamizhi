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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const sheetOpen = ref(false)

onMounted(() => {
  document.documentElement.classList.remove('dark')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}

const navigate = (path: string) => {
  router.push(path)
  sheetOpen.value = false // Close sheet after navigation
}
</script>

<template>
  <SidebarProvider>
    <!-- Desktop Sidebar -->
    <Sidebar collapsible="icon" class="border-r bg-background hidden md:flex">
      <SidebarTrigger>
        <Asterisk class="h-6 w-6" />
      </SidebarTrigger>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton 
            @click="navigate('/')"
            :is-active="route.path === '/'"
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

    <!-- Mobile Menu -->
    <div class="md:hidden fixed top-0 left-0 right-0 p-2 bg-background border-b z-50">
      <div class="flex items-center">
        <Sheet v-model:open="sheetOpen">
          <SheetTrigger asChild>
            <div class="flex items-center gap-2 cursor-pointer">
              <Asterisk class="h-6 w-6" />
              <span class="text-lg font-semibold">தமிழி</span>
            </div>
          </SheetTrigger>
          <SheetContent side="left" class="w-[250px] p-0">
            <div class="flex flex-col h-full bg-background">
              <div class="p-4 border-b">
                <div class="flex items-center gap-2">
                  <Asterisk class="h-6 w-6" />
                  <span class="text-lg font-semibold">தமிழி</span>
                </div>
              </div>
              
              <div class="flex-1 p-2">
                <div class="space-y-2">
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/alai' }"
                    @click="navigate('/alai')"
                  >
                    <Globe class="mr-2 h-5 w-5" />
                    அலை
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/thamizhi' }"
                    @click="navigate('/thamizhi')"
                  >
                    <MessageSquare class="mr-2 h-5 w-5" />
                    தமிழி
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/katrai' }"
                    @click="navigate('/katrai')"
                  >
                    <Library class="mr-2 h-5 w-5" />
                    கற்றை 
                  </Button>
                </div>
              </div>
              
              <div class="border-t p-2">
                <Button 
                  variant="ghost" 
                  class="w-full justify-start"
                  @click="toggleTheme"
                >
                  <Sun v-if="!isDark" class="mr-2 h-5 w-5" />
                  <Moon v-else class="mr-2 h-5 w-5" />
                  {{ isDark ? 'Dark' : 'Light' }} Mode
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden bg-background md:mt-0 mt-[60px]">
      <slot />
    </main>
  </SidebarProvider>
</template> 