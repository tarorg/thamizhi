<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarTrigger,
  SidebarFooter 
} from '@/components/ui/sidebar'
import { Globe, Library, MessageSquare, Sun, Moon, Settings, LogIn, LogOut, User } from 'lucide-vue-next'
import { useRoute, useRouter } from '#imports'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import IconAsterisk from '@/components/icons/IconAsterisk.vue'
import { useMastodon } from '~/composables/useMastodon'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const sheetOpen = ref(false)

// Initialize Mastodon composable
const mastodonAuth = useMastodon()
const { isAuthenticated, mastodonUser, logout } = mastodonAuth

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

const handleLogout = async () => {
  await logout()
  sheetOpen.value = false
}

// Debug auth state
watch([isAuthenticated, mastodonUser], ([newAuth, newUser]) => {
  console.log('Auth state changed:', { isAuthenticated: newAuth, user: newUser })
})
</script>

<template>
  <SidebarProvider>
    <!-- Desktop Sidebar -->
    <Sidebar collapsible="icon" class="border-r bg-background hidden md:flex">
      <SidebarTrigger>
        <IconAsterisk class="h-5 w-5 text-foreground" />
      </SidebarTrigger>
      
      <SidebarContent>
        <!-- User Profile Section -->
        <div v-if="isAuthenticated && mastodonUser" class="px-2 py-4">
          <div class="flex items-center space-x-4 mb-4">
            <Avatar>
              <AvatarImage :src="mastodonUser.avatar" :alt="mastodonUser.display_name" />
              <AvatarFallback>{{ mastodonUser.display_name?.charAt(0) }}</AvatarFallback>
            </Avatar>
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">{{ mastodonUser.display_name }}</p>
              <p class="text-xs text-muted-foreground">@{{ mastodonUser.acct }}</p>
            </div>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuButton 
            @click="navigate('/')"
            :is-active="route.path === '/'"
            tooltip="அலை"
            class="text-foreground hover:bg-transparent"
          >
            <Globe class="text-foreground" />
            <span>அலை</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/thamizhi')"
            :is-active="route.path === '/thamizhi'"
            tooltip="தமிழி"
            class="text-foreground hover:bg-transparent"
          >
            <MessageSquare class="text-foreground" />
            <span>தமிழி</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/noolakam')"
            :is-active="route.path === '/noolakam'"
            tooltip="நூலகம்"
            class="text-foreground hover:bg-transparent"
          >
            <Library class="text-foreground" />
            <span>நூலகம்</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuButton 
          @click="toggleTheme"
          tooltip="Toggle Theme"
          class="text-foreground hover:bg-transparent"
        >
          <Sun v-if="!isDark" class="text-foreground" />
          <Moon v-else class="text-foreground" />
          <span>{{ isDark ? 'Dark' : 'Light' }} Mode</span>
        </SidebarMenuButton>

        <SidebarMenuButton 
          @click="navigate('/settings')"
          :is-active="route.path === '/settings'"
          tooltip="Settings"
          class="text-foreground hover:bg-transparent"
        >
          <Settings class="text-foreground" />
          <span>Settings</span>
        </SidebarMenuButton>

        <!-- Authentication Buttons -->
        <template v-if="isAuthenticated">
          <SidebarMenuButton 
            @click="navigate('/profile')"
            :is-active="route.path === '/profile'"
            tooltip="Profile"
            class="text-foreground hover:bg-transparent"
          >
            <User class="text-foreground" />
            <span>Profile</span>
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="handleLogout"
            tooltip="Sign Out"
            class="text-foreground hover:bg-transparent"
          >
            <LogOut class="text-foreground" />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </template>
        <template v-else>
          <SidebarMenuButton 
            @click="navigate('/signin')"
            :is-active="route.path === '/signin'"
            tooltip="Sign In"
            class="text-foreground hover:bg-transparent"
          >
            <LogIn class="text-foreground" />
            <span>Sign In</span>
          </SidebarMenuButton>
        </template>
      </SidebarFooter>
    </Sidebar>

    <!-- Mobile Menu -->
    <div class="md:hidden fixed top-0 left-0 right-0 p-2 bg-background border-b z-50">
      <div class="flex items-center">
        <Sheet v-model:open="sheetOpen">
          <SheetTrigger asChild>
            <div class="flex items-center gap-2 cursor-pointer">
              <IconAsterisk class="h-5 w-5 text-foreground" />
              <span class="text-lg font-semibold">தமிழி</span>
            </div>
          </SheetTrigger>
          <SheetContent side="left" class="w-[250px] p-0">
            <div class="flex flex-col h-full bg-background">
              <div class="p-4 border-b">
                <div v-if="isAuthenticated && mastodonUser" class="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage :src="mastodonUser.avatar" :alt="mastodonUser.display_name" />
                    <AvatarFallback>{{ mastodonUser.display_name?.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <div class="space-y-1">
                    <p class="text-sm font-medium leading-none">{{ mastodonUser.display_name }}</p>
                    <p class="text-xs text-muted-foreground">@{{ mastodonUser.acct }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <IconAsterisk class="h-5 w-5 text-foreground" />
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
                    :class="{ 'bg-accent': route.path === '/noolakam' }"
                    @click="navigate('/noolakam')"
                  >
                    <Library class="mr-2 h-5 w-5" />
                    நூலகம் 
                  </Button>
                </div>
              </div>
              
              <div class="border-t p-2">
                <Button 
                  variant="ghost" 
                  class="w-full justify-start"
                  :class="{ 'bg-accent': route.path === '/settings' }"
                  @click="navigate('/settings')"
                >
                  <Settings class="mr-2 h-5 w-5" />
                  Settings
                </Button>

                <!-- Authentication Buttons for Mobile -->
                <template v-if="isAuthenticated">
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/profile' }"
                    @click="navigate('/profile')"
                  >
                    <User class="mr-2 h-5 w-5" />
                    Profile
                  </Button>

                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    @click="handleLogout"
                  >
                    <LogOut class="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </template>
                <template v-else>
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/signin' }"
                    @click="navigate('/signin')"
                  >
                    <LogIn class="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </template>
                
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
    <div class="flex-1 md:ml-[250px] pt-[60px] md:pt-0">
      <slot />
    </div>
  </SidebarProvider>
</template>