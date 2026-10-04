// Pantallas de autenticación: nunca son un destino válido (evita bucles login → login).
const AUTH_PATHS = ['/login', '/crear-cuenta', '/recuperar-contrasena', '/reenviar-confirmacion', '/api']

/**
 * Valida un destino post-login recibido por URL (`?redirect=` desde el sitio público o `?callbackUrl=` de Auth.js).
 * Solo se aceptan paths del MISMO origen: sin `//host`, `\host`, esquemas ni caracteres de control, y sin
 * volver a pantallas de login. `callbackUrl` llega absoluto: se acepta únicamente si el origen coincide.
 * Devuelve el path (con query/hash) o `null`. Es la barrera real contra open redirects: el sitio público
 * (backtrackacademy.com) solo propone destinos, aquí se vuelven a validar.
 */
export function safeInternalPath(raw: unknown, origin?: string): string | null {
  if (typeof raw !== 'string')
    return null
  let path = raw.trim()
  if (!path || path.length > 500)
    return null
  if (/^https?:\/\//i.test(path)) {
    if (!origin)
      return null
    try {
      const url = new URL(path)
      if (url.origin !== origin)
        return null
      path = url.pathname + url.search + url.hash
    }
    catch {
      return null
    }
  }
  if (path[0] !== '/' || path[1] === '/' || path[1] === '\\')
    return null
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F\\]/.test(path))
    return null
  const pathname = path.split(/[?#]/)[0]
  if (AUTH_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`)))
    return null
  return path
}
