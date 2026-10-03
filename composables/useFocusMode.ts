// Modo foco del Learning Workspace: oculta sidebar y topbar del shell. Se recuerda por cookie (SSR-safe).
export function useFocusMode() {
  const cookie = useCookie<boolean>('bta-focus', { default: () => false, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  const focus = useState<boolean>('focus-mode', () => cookie.value === true)

  watch(focus, (value) => {
    cookie.value = value
  })

  const toggleFocus = () => {
    focus.value = !focus.value
  }

  return { focus, toggleFocus }
}
