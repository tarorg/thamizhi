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
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },
  tailwindcss: {
    // your tailwind config here
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  build: {
    transpile: ['@editorjs/editorjs'],
  },
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: false,
      routes: [
        '/',
        '/noolakam',
        '/pathivu'
      ]
    }
  },
  routeRules: {
    // Client-side only routes (no prerendering)
    '/thamizhi': { ssr: false },
    '/settings': { ssr: false },
    '/izhai': { ssr: false },
    '/poster': { ssr: false },
    // Add caching for static assets
    '/assets/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    },
  },
  app: {
    head: {
      title: 'தமிழி',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Tamil Literature Platform' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  ssr: true,
  experimental: {
    payloadExtraction: false
  }
})