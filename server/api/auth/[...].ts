import process from 'node:process'
import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import LinkedInProvider from 'next-auth/providers/linkedin'

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
        catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Server error')
        }
      },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    GithubProvider.default({
      clientId: process.env.NUXT_PUBLIC_GITHUB_ID,
      clientSecret: process.env.NUXT_PUBLIC_GITHUB_SECRET,
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    LinkedInProvider.default({
      clientId: process.env.NUXT_PUBLIC_LINKEDIN_KEY,
      clientSecret: process.env.NUXT_PUBLIC_LINKEDIN_SECRET,
    }),
  ],
  // Add session configuration if needed
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        try {
          const response = await fetch(`${process.env.NUXT_PUBLIC_API_BASE_URL}/api/v1/auth/github/callback|`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${account.access_token}`,
            },
            body: JSON.stringify({ provider: 'github', access_token: account.access_token }),
          })

          if (!response.ok) {
            console.error('Failed to authenticate with backend:', response.status, await response.text())
            return false
          }

          const data = await response.json()
          user.backendToken = data.token // Token del backend
        }
        catch (error) {
          console.error('Backend authentication error:', error)
          return false
        }
      }
      return true
    },

    async session({ session, token }) {
      session.user = token.user
      session.backendToken = token.backendToken
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user
        token.backendToken = user.backendToken
      }
      return token
    },
  },
})
