<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import IconAsterisk from '@/components/icons/IconAsterisk.vue'
import { useMastodon } from '@/composables/useMastodon'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const sheetOpen = ref(false)
const showProfileMenu = ref(false)
const { mastodonUser, accessToken, validateToken, signOut } = useMastodon()

const isAuthenticated = computed(() => {
  const hasAuth = !!accessToken.value && !!mastodonUser.value
  console.log('Authentication state:', { 
    hasToken: !!accessToken.value,
    hasUser: !!mastodonUser.value,
    user: mastodonUser.value,
    isAuth: hasAuth
  })
  return hasAuth
})

// Watch for changes in authentication state
watch([accessToken, mastodonUser], async ([newToken, newUser]) => {
  console.log('Auth state changed:', { 
    hasToken: !!newToken,
    hasUser: !!newUser,
    user: newUser
  })
  if (newToken && !newUser) {
    const valid = await validateToken()
    console.log('Token validation result:', valid)
  }
})

onMounted(async () => {
  console.log('Layout mounted, checking auth state')
  if (accessToken.value) {
    const valid = await validateToken()
    console.log('Initial token validation:', valid)
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}

const navigate = (path: string) => {
  router.push(path)
  sheetOpen.value = false // Close sheet after navigation
  showProfileMenu.value = false // Close profile menu
}

const handleSignOut = async () => {
  showProfileMenu.value = false // Close profile menu
  signOut()
  await router.push('/')
}
</script>

<template>
  <SidebarProvider>
    <!-- Desktop Sidebar -->
    <Sidebar collapsible="icon" class="border-r bg-background hidden md:flex">
      <SidebarTrigger>
        <IconAsterisk class="h-5 w-5 text-foreground" />
      </SidebarTrigger>
      
      <SidebarContent>
        <!-- Profile Section -->
        <div v-if="isAuthenticated && mastodonUser" class="p-4 border-b">
          <Popover v-model:open="showProfileMenu">
            <PopoverTrigger as-child>
              <Button 
                variant="ghost" 
                class="w-full p-2 h-auto hover:bg-accent"
              >
                <div class="flex items-center space-x-3 w-full">
                  <img 
                    :src="mastodonUser.avatar" 
                    :alt="mastodonUser.display_name"
                    class="w-8 h-8 rounded-full"
                    @error="$event.target.src = 'https://mastodon.social/avatars/original/missing.png'"
                  />
                  <div class="flex flex-col overflow-hidden text-left">
                    <span class="font-medium text-sm truncate">{{ mastodonUser.display_name }}</span>
                    <span class="text-xs text-muted-foreground truncate">@{{ mastodonUser.username }}</span>
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-56 p-2">
              <Button 
                variant="ghost" 
                class="w-full justify-start"
                @click="handleSignOut"
              >
                <LogOut class="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </PopoverContent>
          </Popover>
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
          v-if="!isAuthenticated"
          @click="navigate('/signin')"
          :is-active="route.path === '/signin'"
          tooltip="Sign In"
          class="text-foreground hover:bg-transparent"
        >
          <LogIn class="text-foreground" />
          <span>Sign In</span>
        </SidebarMenuButton>
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
                <div class="flex items-center gap-2">
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
              <div class="border-t p-2 space-y-2">
                <!-- Theme Toggle -->
                <Button 
                  variant="ghost" 
                  class="w-full justify-start"
                  @click="toggleTheme"
                >
                  <Sun v-if="!isDark" class="mr-2 h-5 w-5" />
                  <Moon v-else class="mr-2 h-5 w-5" />
                  {{ isDark ? 'Dark' : 'Light' }} Mode
                </Button>

                <!-- Sign In / Profile -->
                <Button 
                  v-if="!isAuthenticated"
                  variant="ghost" 
                  class="w-full justify-start"
                  :class="{ 'bg-accent': route.path === '/signin' }"
                  @click="navigate('/signin')"
                >
                  <LogIn class="mr-2 h-5 w-5" />
                  Sign In
                </Button>

                <div v-else>
                  <Popover v-model:open="showProfileMenu">
                    <PopoverTrigger as-child>
                      <Button 
                        variant="ghost" 
                        class="w-full p-2 h-auto hover:bg-accent"
                      >
                        <div class="flex items-center space-x-3 w-full">
                          <img 
                            :src="mastodonUser?.avatar" 
                            :alt="mastodonUser?.display_name"
                            class="w-8 h-8 rounded-full"
                            @error="$event.target.src = 'https://mastodon.social/avatars/original/missing.png'"
                          />
                          <div class="flex flex-col overflow-hidden text-left">
                            <span class="font-medium text-sm truncate">{{ mastodonUser?.display_name }}</span>
                            <span class="text-xs text-muted-foreground truncate">@{{ mastodonUser?.username }}</span>
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-56 p-2">
                      <Button 
                        variant="ghost" 
                        class="w-full justify-start mb-1"
                        @click="navigate('/settings')"
                      >
                        <Settings class="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        class="w-full justify-start text-destructive hover:text-destructive"
                        @click="handleSignOut"
                      >
                        <LogOut class="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
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

<style scoped>
/* Remove the invert and filter-none styles since we're using fill-current now */
</style>