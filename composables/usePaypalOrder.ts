export interface Addon {
  id: number
  name: string
  kind: 'opportunities' | 'vouchers'
  price: number
  old_price: number
  discount_percent: number
  opportunities: number
  vouchers: number
}

export interface OrderCapture {
  status: 'completed' | 'pending' | 'failed'
  opportunities: number
  vouchers: number
  balance: { opportunities: number, vouchers: number }
}

// Códigos de error de la API (api/v1/paypal/orders) -> mensaje para el usuario.
const ERROR_MESSAGES: Record<string, string> = {
  paypal_rest_disabled: 'El pago con PayPal aún no está disponible para tu cuenta.',
  product_not_found: 'Este producto ya no está disponible.',
  invalid_redirect_url: 'No pudimos iniciar el pago. Contacta a soporte.',
  paypal_unavailable: 'PayPal no responde en este momento. Intenta de nuevo en unos minutos.',
  paypal_not_configured: 'El pago con PayPal no está disponible. Contacta a soporte.',
  paypal_error: 'PayPal rechazó la operación. Intenta de nuevo o contacta a soporte.',
}

// Compra única de oportunidades de examen y vouchers de especialidad (PayPal Orders).
export function usePaypalOrder() {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  function messageFor(e: any): string {
    const code = e?.data?.error as string | undefined
    return (code && ERROR_MESSAGES[code]) || 'Ocurrió un error inesperado. Intenta de nuevo.'
  }

  async function buy(items: { product_id: number, quantity: number }[]) {
    loading.value = true
    error.value = null
    try {
      const origin = window.location.origin
      const res = await $api<{ approve_url: string }>('/paypal/orders', {
        method: 'POST',
        body: {
          items,
          return_url: `${origin}/suscripciones/paypal/orden`,
          cancel_url: `${origin}/suscripciones/extras`,
        },
      })
      if (!res.approve_url) {
        error.value = ERROR_MESSAGES.paypal_error
        loading.value = false
        return
      }
      // PayPal pide la aprobación en su propio sitio: salimos de la SPA.
      window.location.href = res.approve_url
    }
    catch (e) {
      error.value = messageFor(e)
      loading.value = false
    }
  }

  const capture = (orderId: string) =>
    $api<OrderCapture>(`/paypal/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST' })

  return { loading, error, buy, capture, messageFor }
}
