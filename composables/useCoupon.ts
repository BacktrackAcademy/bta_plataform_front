export interface Coupon {
  code: string
  discount_rate: number
  expires_at: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_coupon: 'El cupón no existe. Revisa que esté bien escrito.',
  coupon_expired: 'Este cupón ya venció o no tiene usos disponibles.',
}

export function useCoupon() {
  const { $api } = useNuxtApp()
  const coupon = ref<Coupon | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function apply(code: string) {
    const trimmed = code.trim()
    if (!trimmed) {
      error.value = 'Ingresa un código de cupón.'
      return
    }
    loading.value = true
    error.value = null
    try {
      coupon.value = await $api<Coupon>('/coupons/validate', { method: 'POST', body: { code: trimmed } })
    }
    catch (e: any) {
      coupon.value = null
      error.value = ERROR_MESSAGES[e?.data?.error as string] ?? 'No pudimos validar el cupón. Intenta de nuevo.'
    }
    finally {
      loading.value = false
    }
  }

  function remove() {
    coupon.value = null
    error.value = null
  }

  return { coupon, loading, error, apply, remove }
}
