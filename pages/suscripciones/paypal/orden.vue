<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})

type ViewState = 'checking' | 'completed' | 'pending' | 'failed'

const route = useRoute()
const { capture } = usePaypalOrder()
const { cart, clearAddons } = useCart()
const state = ref<ViewState>('checking')
const result = ref<OrderCapture | null>(null)

// PayPal vuelve aquí con ?token=<id de la orden>. El pago no se cobra hasta capturarlo: lo hace el backend,
// que acredita una sola vez aunque esta página se recargue.
onMounted(async () => {
  const token = String(route.query.token ?? '')
  if (!token) {
    state.value = 'failed'
    return
  }
  try {
    result.value = await capture(token)
    state.value = result.value.status
    if (state.value === 'completed')
      clearAddons()
  }
  catch {
    state.value = 'failed'
  }
})

const label = computed(() => {
  const r = result.value
  if (!r)
    return ''
  const parts = []
  if (r.opportunities)
    parts.push(`${r.opportunities} ${r.opportunities === 1 ? 'oportunidad' : 'oportunidades'}`)
  if (r.vouchers)
    parts.push(`${r.vouchers} ${r.vouchers === 1 ? 'voucher' : 'vouchers'}`)
  return parts.join(' y ')
})
</script>

<template>
  <section class="min-h-screen py-12">
    <div class="container mx-auto px-4 max-w-xl text-center text-foreground">
      <div class="bt-surface p-8">
        <template v-if="state === 'checking'">
          <Icon name="lucide:loader-circle" class="size-10 text-primary-text animate-spin mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            Confirmando tu compra
          </h2>
          <p class="mt-2 t-small">
            Estamos verificando el pago con PayPal. No cierres esta página.
          </p>
        </template>

        <template v-else-if="state === 'completed'">
          <Icon name="lucide:circle-check" class="size-10 text-success mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            ¡Compra confirmada!
          </h2>
          <p class="mt-2 t-small">
            Acreditamos {{ label }} en tu cuenta. Ahora tienes
            {{ result?.balance.opportunities }} oportunidades y {{ result?.balance.vouchers }} vouchers disponibles.
          </p>
          <NuxtLink
            v-if="cart.plan"
            :to="{ path: '/suscripciones/carrito', query: { plan: cart.plan } }"
            class="bt-btn-primary bt-btn-lg mt-6"
          >
            Paso 2: continuar con tu suscripción
          </NuxtLink>
          <NuxtLink v-else to="/dashboard" class="bt-btn-primary bt-btn-lg mt-6">
            Ir al inicio
          </NuxtLink>
        </template>

        <template v-else-if="state === 'pending'">
          <Icon name="lucide:shield-alert" class="size-10 text-warning mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            PayPal está revisando tu pago
          </h2>
          <p class="mt-2 t-small">
            Tu compra quedó registrada. Cuando PayPal confirme el pago te avisaremos y lo acreditaremos.
            No pagues de nuevo; si tarda, escríbenos a contacto@backtrackacademy.com.
          </p>
          <NuxtLink to="/dashboard" class="bt-btn-secondary bt-btn-lg mt-6">
            Ir al inicio
          </NuxtLink>
        </template>

        <template v-else>
          <Icon name="lucide:circle-x" class="size-10 text-danger mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            No pudimos confirmar tu compra
          </h2>
          <p class="mt-2 t-small">
            Si PayPal te cobró, escríbenos a contacto@backtrackacademy.com y lo resolvemos.
          </p>
          <NuxtLink to="/suscripciones/extras" class="bt-btn-secondary bt-btn-lg mt-6">
            Volver a la tienda
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>
