/** Builds an absolute URL to a page of the public landing app (team, legal pages, FAQ...). */
export function useLandingUrl() {
  const base = useRuntimeConfig().public.landingUrl.replace(/\/$/, '')
  return (path: string) => `${base}${path}`
}
