export interface PaypalSubscription {
  id: number
  status: 'creating' | 'pending' | 'active' | 'suspended' | 'cancelled' | 'expired' | 'abandoned' | 'failed'
  plan_months: number
  amount: string
  next_billing_at: string | null
}

export interface PaypalEligibility {
  flow: 'rest' | 'legacy'
  rest_enabled: boolean
  rest_subscription: PaypalSubscription | null
  legacy_subscription: {
    can_migrate: boolean
    reason: string | null
    next_billing_at: string | null
    amount: string | null
    months: number | null
  } | null
}

// Códigos de error de la API (api/v1/paypal/*) -> mensaje para el usuario.
const ERROR_MESSAGES: Record<string, string> = {
  paypal_rest_disabled: 'El pago con PayPal aún no está disponible para tu cuenta.',
  migration_disabled: 'La migración aún no está disponible para tu cuenta.',
  legacy_subscription_active: 'Ya tienes un pago recurrente activo. Cancélalo o migra tu suscripción antes de crear otra.',
  subscription_exists: 'Ya tienes una suscripción vigente.',
  cart_not_supported: 'Este plan no se puede comprar por aquí todavía.',
  product_not_found: 'El plan seleccionado ya no está disponible.',
  invalid_redirect_url: 'No pudimos iniciar el pago. Contacta a soporte.',
  paypal_unavailable: 'PayPal no responde en este momento. Intenta de nuevo en unos minutos.',
  paypal_not_configured: 'El pago con PayPal no está disponible. Contacta a soporte.',
  paypal_error: 'PayPal rechazó la operación. Intenta de nuevo o contacta a soporte.',
  too_close_to_renewal: 'Tu renovación es muy próxima. Podrás migrar después de que se procese.',
  legacy_not_active: 'Tu pago recurrente actual no está activo.',
  unsupported_plan: 'Tu plan actual no se puede migrar automáticamente. Contacta a soporte.',
  already_migrated: 'Tu suscripción ya fue migrada.',
}

export function usePaypalSubscription() {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  function messageFor(e: any): string {
    const code = e?.data?.error as string | undefined
    return (code && ERROR_MESSAGES[code]) || 'Ocurrió un error inesperado. Intenta de nuevo.'
  }

  // La API valida que estas URLs pertenezcan a hosts permitidos (PAYPAL_ALLOWED_RETURN_HOSTS).
  function redirectUrls() {
    const origin = window.location.origin
    return {
      return_url: `${origin}/suscripciones/paypal/retorno`,
      cancel_url: `${origin}/suscripciones/paypal/cancelado`,
    }
  }

  async function goToApproval(path: string, body: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await $api<{ approve_url: string }>(path, {
        method: 'POST',
        body: { ...body, ...redirectUrls() },
      })
      if (!res.approve_url) {
        error.value = ERROR_MESSAGES.paypal_error
        return
      }
      // PayPal pide la aprobación en su propio sitio: salimos de la SPA.
      window.location.href = res.approve_url
    }
    catch (e) {
      error.value = messageFor(e)
    }
    finally {
      loading.value = false
    }
  }

  const subscribe = (productId: number, discountCode?: string) =>
    goToApproval('/paypal/subscriptions', { product_id: productId, discount_code: discountCode })

  const migrate = () => goToApproval('/paypal/migrations', {})

  const getSubscription = (id: number) => $api<PaypalSubscription>(`/paypal/subscriptions/${id}`)

  return { loading, error, subscribe, migrate, getSubscription, messageFor }
}
