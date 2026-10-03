// Origen canónico del sitio (URLs absolutas para canonical, Open Graph y JSON-LD).
export function useSiteUrl() {
  const config = useRuntimeConfig()
  const base = String(config.public.siteUrl || 'https://backtrackacademy.com').replace(/\/$/, '')
  return (path = '') => `${base}${path}`
}
