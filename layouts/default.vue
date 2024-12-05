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
import { Globe, Library, MessageSquare, Sun, Moon, Settings, LogIn, LogOut, User, PenSquare, Layers } from 'lucide-vue-next'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const route = useRoute()
const router = useRouter()
const isDark = ref(false)
const sheetOpen = ref(false)
const showProfileMenu = ref(false)
const { mastodonUser, accessToken, validateToken, signOut } = useMastodon()
const currentLanguage = ref('TA')
const state = ref('expanded')
const userRole = ref('')

// Fetch user role from localStorage on mount
onMounted(() => {
  const storedRole = localStorage.getItem('userRole')
  if (storedRole) {
    userRole.value = storedRole
    console.log('User Role Loaded:', storedRole) // Log role loading
  }
})

// Watch for changes in localStorage
watch(() => localStorage.getItem('userRole'), (newRole) => {
  if (newRole) {
    userRole.value = newRole
    console.log('User Role Updated:', newRole) // Log role update
  } else {
    userRole.value = ''
    console.log('User Role Cleared') // Log role clearing
  }
})

const isPublisher = computed(() => userRole.value === 'publisher')

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
  const storedRole = localStorage.getItem('userRole')
  if (storedRole) {
    userRole.value = storedRole
  }
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
      
      <SidebarContent v-if="state === 'expanded'">
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

          <!-- Publisher-specific menu items -->
          <template v-if="isPublisher">
            <SidebarMenuButton 
              @click="navigate('/izhaigal')"
              :is-active="route.path === '/izhaigal'"
              tooltip="இழை"
              class="text-foreground hover:bg-transparent"
            >
              <Layers class="text-foreground" />
              <span>இழை</span>
            </SidebarMenuButton>

            <SidebarMenuButton 
              @click="navigate('/pathivu')"
              :is-active="route.path === '/pathivu'"
              tooltip="பதிவு"
              class="text-foreground hover:bg-transparent"
            >
              <PenSquare class="text-foreground" />
              <span>பதிவு</span>
            </SidebarMenuButton>
          </template>

          <!-- Bottom Icons Container -->
          <div class="mt-auto flex flex-col gap-2 p-2">
            
          </div>
        </SidebarMenu>

        <div class="mt-auto space-y-2">
          <!-- Profile Section -->
          <div v-if="isAuthenticated && mastodonUser">
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
                    />
                    <div class="text-left flex-1">
                      <div class="font-medium">{{ mastodonUser.display_name }}</div>
                      <div class="text-sm text-muted-foreground">@{{ mastodonUser.username }}</div>
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-56 p-2">
                <Button 
                  variant="ghost" 
                  class="w-full justify-start gap-2 mb-1"
                  @click="navigate('/settings')"
                >
                  <Settings class="h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  class="w-full justify-start gap-2"
                  @click="handleSignOut"
                >
                  <LogOut class="h-4 w-4" />
                  Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </SidebarContent>

      <SidebarContent v-else>
        <SidebarMenu>
          <SidebarMenuButton 
            @click="navigate('/')"
            :is-active="route.path === '/'"
          >
            <Globe class="h-5 w-5" />
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/thamizhi')"
            :is-active="route.path === '/thamizhi'"
          >
            <MessageSquare class="h-5 w-5" />
          </SidebarMenuButton>

          <SidebarMenuButton 
            @click="navigate('/noolakam')"
            :is-active="route.path === '/noolakam'"
          >
            <Library class="h-5 w-5" />
          </SidebarMenuButton>

          <!-- Publisher-specific menu items -->
          <template v-if="isPublisher">
            <SidebarMenuButton 
              @click="navigate('/izhaigal')"
              :is-active="route.path === '/izhaigal'"
            >
              <Layers class="h-5 w-5" />
            </SidebarMenuButton>

            <SidebarMenuButton 
              @click="navigate('/pathivu')"
              :is-active="route.path === '/pathivu'"
            >
              <PenSquare class="h-5 w-5" />
            </SidebarMenuButton>
          </template>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
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
              <div class="flex-1 p-2 overflow-y-auto">
                <div class="space-y-2">
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/' }"
                    @click="navigate('/')"
                  >
                    <Globe class="mr-2 h-5 w-5" />
                    அலை
                  </Button>
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/izhai' }"
                    @click="navigate('/izhai')"
                  >
                    <Layers class="mr-2 h-5 w-5" />
                    இழை
                  </Button>
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    :class="{ 'bg-accent': route.path === '/padhivu' }"
                    @click="navigate('/padhivu')"
                  >
                    <PenSquare class="mr-2 h-5 w-5" />
                    பதிவு
                  </Button>
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start"
                    @click="toggleTheme"
                  >
                    <Sun v-if="isDark" class="mr-2 h-5 w-5" />
                    <Moon v-else class="mr-2 h-5 w-5" />
                    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
                  </Button>

                  <div v-if="isAuthenticated && mastodonUser">
                    <Button 
                      variant="ghost" 
                      class="w-full justify-start"
                      @click="navigate('/settings')"
                    >
                      <Settings class="mr-2 h-5 w-5" />
                      Settings
                    </Button>
                    <Button 
                      variant="ghost" 
                      class="w-full justify-start"
                      @click="handleSignOut"
                    >
                      <LogOut class="mr-2 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                  <Button 
                    v-else
                    variant="ghost" 
                    class="w-full justify-start"
                    @click="navigate('/signin')"
                  >
                    <LogIn class="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
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