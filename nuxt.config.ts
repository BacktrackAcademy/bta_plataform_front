// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-01-18',

  modules: [
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/fonts',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@nuxt/eslint',
  ],
  auth: {
    isEnabled: true,
    originEnvKey: 'NUXT_AUTH_ORIGIN',
    baseUrl: process.env.NUXT_AUTH_ORIGIN || 'http://localhost:4321',
    origin: process.env.NUXT_AUTH_ORIGIN || 'http://localhost:4321',
    basePath: '/api/auth',
    enableSessionStorage: true,
    enableGlobalAppMiddleware: true,
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
      httpOnly: true,
    },
    provider: {
      type: 'authjs',
    },
    globalMiddleware: false,
    session: {
      enableSessionRefresh: true,
      strategies: {
        session: {
          endpoints: {
            session: '/api/auth/session',
          },
        },
      },
    },
    defaultProvider: 'credentials',
    baseURL: process.env.NUXT_AUTH_ORIGIN || 'http://localhost:4321',
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_AUTH_ORIGIN,
      // Base URL of the public landing app. Override with NUXT_PUBLIC_LANDING_URL
      landingUrl: 'http://localhost:4322',
      authCookieName: process.env.NUXT_PUBLIC_AUTH_COOKIE_NAME,
      authTokenName: process.env.NUXT_PUBLIC_AUTH_TOKEN_NAME,
      // web3forms_access_key: '',
    },
  },

  routeRules: {
    // The public landing lives in its own app: the platform always starts at the login
    // (authenticated users are bounced to the dashboard by the `guest` middleware).
    '/': { redirect: '/login' },
  },

  experimental: {
    typedPages: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
