<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})

type ViewState = 'checking' | 'active' | 'pending' | 'failed'

const { getSubscription } = usePaypalSubscription()
const { $api } = useNuxtApp()

const state = ref<ViewState>('checking')
const MAX_ATTEMPTS = 20 // ~1 minuto: PayPal confirma por webhook, puede tardar unos segundos
const INTERVAL_MS = 3000
let timer: ReturnType<typeof setInterval> | undefined

// PayPal vuelve aquí tras la aprobación. El estado real lo confirma el backend con PayPal
// (GET /paypal/subscriptions/:id sincroniza); aquí solo esperamos a que figure como activa.
async function check(id: number) {
  const sub = await getSubscription(id)
  if (sub.status === 'active') {
    state.value = 'active'
    return true
  }
  if (['cancelled', 'expired', 'failed', 'abandoned'].includes(sub.status)) {
    state.value = 'failed'
    return true
  }
  return false
}

onMounted(async () => {
  try {
    const eligibility = await $api<PaypalEligibility>('/paypal/eligibility')
    const sub = eligibility.rest_subscription
    if (!sub) {
      state.value = 'failed'
      return
    }
    if (await check(sub.id))
      return

    let attempts = 1
    timer = setInterval(async () => {
      attempts++
      try {
        if (await check(sub.id) || attempts >= MAX_ATTEMPTS) {
          clearInterval(timer)
          if (state.value === 'checking')
            state.value = 'pending'
        }
      }
      catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(timer)
          state.value = 'pending'
        }
      }
    }, INTERVAL_MS)
  }
  catch {
    state.value = 'failed'
  }
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="min-h-screen bg-bta-section py-12">
    <div class="container mx-auto px-4 max-w-xl text-center text-white">
      <div class="bg-bta-dark-blue rounded-lg shadow-lg p-8">
        <template v-if="state === 'checking'">
          <Icon name="lucide:loader-circle" class="size-10 text-bta-pink animate-spin mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            Confirmando tu suscripción
          </h2>
          <p class="mt-2 text-gray-muted font-inconsolata text-sm">
            Estamos verificando el pago con PayPal. No cierres esta página.
          </p>
        </template>

        <template v-else-if="state === 'active'">
          <Icon name="lucide:circle-check" class="size-10 text-green-400 mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            ¡Suscripción activada!
          </h2>
          <p class="mt-2 text-gray-muted font-inconsolata text-sm">
            Tu acceso se habilita en unos instantes, apenas PayPal confirma el cobro.
          </p>
          <NuxtLink to="/dashboard" class="inline-block mt-6 py-3 px-6 bg-bta-pink hover:bg-bta-pink/90 rounded-lg font-semibold font-inconsolata">
            Ir al inicio
          </NuxtLink>
        </template>

        <template v-else-if="state === 'pending'">
          <Icon name="lucide:clock" class="size-10 text-yellow-400 mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            Aún estamos confirmando
          </h2>
          <p class="mt-2 text-gray-muted font-inconsolata text-sm">
            PayPal está tardando más de lo normal. No pagues de nuevo: te avisaremos por correo cuando tu suscripción esté activa.
            Si no la ves en unos minutos, escríbenos a contacto@backtrackacademy.com.
          </p>
        </template>

        <template v-else>
          <Icon name="lucide:circle-x" class="size-10 text-red-400 mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            No pudimos confirmar tu suscripción
          </h2>
          <p class="mt-2 text-gray-muted font-inconsolata text-sm">
            Si PayPal te cobró, escríbenos a contacto@backtrackacademy.com y lo resolvemos.
          </p>
          <NuxtLink to="/suscripciones" class="inline-block mt-6 py-3 px-6 bg-bta-blue hover:bg-bta-blue/90 rounded-lg font-semibold font-inconsolata">
            Volver a los planes
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>
