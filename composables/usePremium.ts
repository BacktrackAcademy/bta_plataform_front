// Estado premium REAL (acceso vigente), consultado a la API. El valor guardado en la sesión se fija al
// iniciar sesión y no se entera de compras o vencimientos posteriores; se usa solo como valor inicial.
export function usePremium() {
  const { data: session } = useAuth()
  const { data: info } = useAPI<{ validate_pay?: boolean }>('/user/info', {
    key: 'user-info',
    lazy: true,
    server: false,
  })

  const isPremium = computed(() => info.value?.validate_pay ?? session.value?.user?.validate_pay ?? false)
  const refreshPremium = () => refreshNuxtData('user-info')

  return { isPremium, refreshPremium }
}
