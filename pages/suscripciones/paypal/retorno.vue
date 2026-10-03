<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})

type ViewState = 'checking' | 'active' | 'review' | 'pending' | 'failed'

const { getSubscription } = usePaypalSubscription()
const { $api } = useNuxtApp()

const { refreshPremium } = usePremium()

const state = ref<ViewState>('checking')
const subscriptionActive = ref(false)
const MAX_ATTEMPTS = 20 // ~1 minuto: PayPal confirma por webhook, puede tardar unos segundos
const INTERVAL_MS = 3000
let timer: ReturnType<typeof setInterval> | undefined

// PayPal vuelve aquí tras la aprobación. El estado real lo confirma el backend: la suscripción pasa a
// 'active' al aprobar, pero el ACCESO (premium) se concede cuando PayPal confirma el cobro, que puede
// quedar en revisión. Esperamos a ambos, y si el acceso no llega distinguimos "pago en revisión".
async function check(id: number) {
  const sub = await getSubscription(id)
  if (['cancelled', 'expired', 'failed', 'abandoned'].includes(sub.status)) {
    state.value = 'failed'
    return true
  }
  subscriptionActive.value = sub.status === 'active'
  if (!subscriptionActive.value)
    return false
  const info = await $api<{ validate_pay?: boolean }>('/user/info')
  if (info.validate_pay) {
    state.value = 'active'
    await refreshPremium()
    return true
  }
  return false
}

function finishWaiting() {
  if (state.value === 'checking')
    state.value = subscriptionActive.value ? 'review' : 'pending'
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
          finishWaiting()
        }
      }
      catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(timer)
          finishWaiting()
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
  <section class="min-h-screen bg-surface-2 py-12">
    <div class="container mx-auto px-4 max-w-xl text-center text-foreground">
      <div class="bg-surface-1 rounded-lg shadow-lg p-8">
        <template v-if="state === 'checking'">
          <Icon name="lucide:loader-circle" class="size-10 text-primary-text animate-spin mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            Confirmando tu suscripción
          </h2>
          <p class="mt-2 text-foreground-subtle font-inconsolata text-sm">
            Estamos verificando el pago con PayPal. No cierres esta página.
          </p>
        </template>

        <template v-else-if="state === 'active'">
          <Icon name="lucide:circle-check" class="size-10 text-success mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            ¡Suscripción activada!
          </h2>
          <p class="mt-2 text-foreground-subtle font-inconsolata text-sm">
            Ya tienes acceso Premium.
          </p>
          <NuxtLink to="/dashboard" class="inline-block mt-6 py-3 px-6 bg-primary hover:bg-primary/90 rounded-lg font-semibold font-inconsolata">
            Ir al inicio
          </NuxtLink>
        </template>

        <template v-else-if="state === 'review'">
          <Icon name="lucide:shield-alert" class="size-10 text-warning mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            PayPal está revisando tu pago
          </h2>
          <p class="mt-2 text-foreground-subtle font-inconsolata text-sm">
            Tu suscripción quedó registrada. PayPal retiene algunos pagos para revisión; tu acceso Premium se activa
            automáticamente cuando lo confirme. No pagues de nuevo.
          </p>
          <NuxtLink to="/dashboard" class="inline-block mt-6 py-3 px-6 bg-surface-2 hover:bg-surface-2/90 rounded-lg font-semibold font-inconsolata">
            Ir al inicio
          </NuxtLink>
        </template>

        <template v-else-if="state === 'pending'">
          <Icon name="lucide:clock" class="size-10 text-warning mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            Aún estamos confirmando
          </h2>
          <p class="mt-2 text-foreground-subtle font-inconsolata text-sm">
            PayPal está tardando más de lo normal. No pagues de nuevo: te avisaremos por correo cuando tu suscripción esté activa.
            Si no la ves en unos minutos, escríbenos a contacto@backtrackacademy.com.
          </p>
        </template>

        <template v-else>
          <Icon name="lucide:circle-x" class="size-10 text-danger mx-auto" />
          <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
            No pudimos confirmar tu suscripción
          </h2>
          <p class="mt-2 text-foreground-subtle font-inconsolata text-sm">
            Si PayPal te cobró, escríbenos a contacto@backtrackacademy.com y lo resolvemos.
          </p>
          <NuxtLink to="/suscripciones" class="inline-block mt-6 py-3 px-6 bg-surface-2 hover:bg-surface-2/90 rounded-lg font-semibold font-inconsolata">
            Volver a los planes
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>
