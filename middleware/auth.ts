export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useMastodon()
  
  if (!isAuthenticated.value) {
    return navigateTo('/signin')
  }
})
