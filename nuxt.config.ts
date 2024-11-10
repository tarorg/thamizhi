// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'shadcn-nuxt'
  ],
  colorMode: {
    classSuffix: ''
  },
  tailwindcss: {
    // your tailwind config here
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  }
})