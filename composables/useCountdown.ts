// Cuenta regresiva hasta `expiresAt` (ISO). Solo corre en el cliente; `expired` pasa a true al llegar a cero.
export function useCountdown(expiresAt: Ref<string | null | undefined>) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  const remainingMs = computed(() => {
    if (!expiresAt.value)
      return null
    return Math.max(0, new Date(expiresAt.value).getTime() - now.value)
  })
  const expired = computed(() => remainingMs.value === 0)

  const label = computed(() => {
    if (remainingMs.value === null)
      return ''
    const total = Math.floor(remainingMs.value / 1000)
    const days = Math.floor(total / 86400)
    const pad = (n: number) => String(n).padStart(2, '0')
    const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
    return days > 0 ? `${days}d ${clock}` : clock
  })

  onMounted(() => {
    now.value = Date.now()
    timer = setInterval(() => (now.value = Date.now()), 1000)
  })
  onBeforeUnmount(() => timer && clearInterval(timer))

  return { label, expired, remainingMs }
}
