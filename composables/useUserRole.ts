// Rol del usuario para mostrar u ocultar pantallas. Es solo UX: la API valida el rol en cada petición.
// Las sesiones anteriores al flujo editorial no traen `role`; en ese caso se consulta una vez a /user/info.
const AUTHOR_ROLES = ['admin', 'content', 'blogger', 'teacher']

export async function useUserRole() {
  const { data: session } = useAuth()
  const role = useState<string | null>('user-role', () => null)

  if (!role.value) {
    role.value = (session.value?.user as { role?: string } | undefined)?.role ?? null
    if (!role.value) {
      try {
        role.value = (await useNuxtApp().$api<{ role: string }>('/user/info')).role
      }
      catch {
        role.value = null
      }
    }
  }

  return {
    role,
    isAdmin: computed(() => role.value === 'admin'),
    canWrite: computed(() => AUTHOR_ROLES.includes(role.value ?? '')),
  }
}
