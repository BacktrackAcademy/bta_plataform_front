export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { data: session, signOut } = useAuth() // Obtener la sesión de Sidebase Auth
  let closingSession = false

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options, request }) {
      // Excluir la ruta de sesión del manejo de autenticación
      if (request.toString().includes('/api/auth/session')) {
        return
      }

      if (session.value?.user?.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${session.value.user.token}`,
        }
      }
    },
    async onResponseError({ response, request }) {
      // No redireccionar si es la ruta de sesión
      if (request.toString().includes('/api/auth/session')) {
        return
      }

      if (response.status === 401) {
        // Token rechazado por la API (p. ej. se regeneró): si solo se redirige a /login, la sesión sigue activa,
        // el middleware guest devuelve al dashboard y las peticiones con el token viejo se repiten en bucle.
        // Se cierra la sesión una sola vez, aunque lleguen varios 401 en paralelo.
        if (closingSession)
          return
        closingSession = true
        try {
          await nuxtApp.runWithContext(() => signOut({ callbackUrl: '/login' }))
        }
        catch {
          await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
        finally {
          closingSession = false
        }
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
