// Páginas solo para visitantes (login, registro). Si ya hay sesión, se continúa hacia el destino que traía el
// visitante (?redirect= desde el sitio público) o, si no hay, al dashboard.
export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  if (status.value === 'authenticated') {
    const origin = useRequestURL().origin
    const stored = useCookie<string | null>('bta_next')
    const target = safeInternalPath(to.query.redirect, origin)
      ?? safeInternalPath(to.query.callbackUrl, origin)
      ?? safeInternalPath(stored.value, origin)
    stored.value = null
    return navigateTo(target ?? { name: 'dashboard' })
  }
})
