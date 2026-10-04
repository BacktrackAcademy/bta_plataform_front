const COOKIE = 'bta_next'

/**
 * Conserva la intención del visitante (p. ej. "comenzar curso X" desde backtrackacademy.com) a través de
 * login, registro y confirmación de email. Prioridad: `?redirect=` → `?callbackUrl=` (Auth.js) → cookie
 * (se guarda al registrarse: el email de confirmación rompe la cadena de URLs). Todo se valida con `safeInternalPath`.
 */
export function usePostLoginRedirect() {
  const route = useRoute()
  const origin = useRequestURL().origin
  const stored = useCookie<string | null>(COOKIE, { maxAge: 60 * 60 * 24, sameSite: 'lax', path: '/', default: () => null })

  const fromQuery = computed(() => safeInternalPath(route.query.redirect, origin) ?? safeInternalPath(route.query.callbackUrl, origin))
  const target = computed(() => fromQuery.value ?? safeInternalPath(stored.value, origin))

  /** Guarda el destino para después de confirmar el email (flujo de registro). */
  function remember() {
    if (fromQuery.value)
      stored.value = fromQuery.value
  }

  /** Destino a usar tras autenticarse; limpia lo guardado. */
  function consume() {
    const t = target.value
    stored.value = null
    return t
  }

  /** Enlace entre login y registro que mantiene el destino. */
  function withRedirect(path: string) {
    return fromQuery.value ? { path, query: { redirect: fromQuery.value } } : path
  }

  return { target, fromQuery, remember, consume, withRedirect }
}
