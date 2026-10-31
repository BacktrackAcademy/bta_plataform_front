import process from 'node:process'
import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'

// Forma de la sesión de la app: idéntica para contraseña y para login social.
function toSessionUser(data: any) {
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    opportunities: data.user.opportunities,
    token: data.token,
    lastname: data.user.lastname,
    aboutme: data.user.aboutme,
    headline: data.user.headline,
    username: data.user.username,
    birthdate: data.user.birthdate,
    country_id: data.user.country_id,
    avatar_url: data.user.avatar_url,
    ranking: data.user.ranking,
    number_followers: data.user.number_followers,
    number_followeds: data.user.number_followeds,
    validate_pay: data.validate_pay,
  }
}

// Credenciales OAuth: solo servidor (sin prefijo NUXT_PUBLIC_). Se aceptan los nombres anteriores como respaldo.
const env = (...names: string[]) => names.map(n => process.env[n]).find(Boolean) ?? ''

const SOCIAL = ['google', 'github', 'facebook', 'linkedin']

export default NuxtAuthHandler({
  // Replace the weak default secret with a strong environment variable
  secret: 'secret',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR
    CredentialsProvider.default({
      name: 'credentials',
      credentials: {},
      async authorize(credentials: { email: string, password: string }) {
        let response: Response
        try {
          response = await fetch(`${process.env.NUXT_PUBLIC_API_BASE_URL}/tokens`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(credentials),
          })
        }
        catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Server error')
        }

        if (response.status >= 500) {
          console.error('Auth backend failure:', response.status)
          throw new Error('Server error')
        }
        if (!response.ok) {
          throw new Error('Invalid credentials')
        }

        try {
          const data = await response.json()
          return toSessionUser(data)
        }
        catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Server error')
        }
      },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    GoogleProvider.default({
      clientId: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET'),
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    GithubProvider.default({
      clientId: env('GITHUB_CLIENT_ID', 'NUXT_PUBLIC_GITHUB_ID'),
      clientSecret: env('GITHUB_CLIENT_SECRET', 'NUXT_PUBLIC_GITHUB_SECRET'),
      // GitHub envía el parámetro `iss` (RFC 9207); sin issuer, openid-client falla con "issuer must be configured".
      issuer: 'https://github.com/login/oauth',
      authorization: { params: { scope: 'read:user user:email' } },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    FacebookProvider.default({
      clientId: env('FACEBOOK_CLIENT_ID'),
      clientSecret: env('FACEBOOK_CLIENT_SECRET'),
      authorization: { params: { scope: 'email public_profile' } },
    }),
    // LinkedIn ahora usa OpenID Connect ("Sign In with LinkedIn"); los scopes r_liteprofile/r_emailaddress ya no se emiten.
    // @ts-expect-error You need to use .default here for it to work during SSR
    LinkedInProvider.default({
      clientId: env('LINKEDIN_CLIENT_ID', 'NUXT_PUBLIC_LINKEDIN_KEY'),
      clientSecret: env('LINKEDIN_CLIENT_SECRET', 'NUXT_PUBLIC_LINKEDIN_SECRET'),
      client: { token_endpoint_auth_method: 'client_secret_post' },
      issuer: 'https://www.linkedin.com/oauth',
      wellKnown: 'https://www.linkedin.com/oauth/.well-known/openid-configuration',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      authorization: { params: { scope: 'openid profile email' } },
      profile: (p: any) => ({ id: p.sub, name: p.name, email: p.email, image: p.picture }),
    }),
  ],
  // Add session configuration if needed
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !SOCIAL.includes(account.provider))
        return true
      // El backend valida el token CON el proveedor y decide si vincula/crea la cuenta; aquí solo se reenvía.
      try {
        const response = await fetch(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/${account.provider}/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_token: account.access_token }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          console.error('Social login rejected by backend:', account.provider, response.status, body?.error)
          // Redirige al login con un código que la pantalla puede explicar (p. ej. email_not_verified).
          return `/login?error=${encodeURIComponent(body?.error ?? 'OAuthCallback')}`
        }

        Object.assign(user, toSessionUser(await response.json()))
      }
      catch (error) {
        console.error('Backend authentication error:', error)
        return false
      }
      return true
    },

    async session({ session, token }) {
      session.user = token.user
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
  },
})
