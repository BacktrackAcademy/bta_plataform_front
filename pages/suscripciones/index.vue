<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})

interface Subscription {
  id: number
  name: string
  price: number
  quantity: number
  opportunities: number
  vouchers: number
  recommended: number
}

const { data: subscriptions } = useAPI<Subscription[]>('/subscriptions')
const { data: eligibility } = useAPI<PaypalEligibility>('/paypal/eligibility')
const { loading, error, subscribe, migrate } = usePaypalSubscription()

const busyPlan = ref<number | null>(null)

const hasActiveRest = computed(() =>
  ['active', 'suspended'].includes(eligibility.value?.rest_subscription?.status ?? ''))
// Suscripción activa en PayPal pero sin acceso todavía: el cobro está en revisión (se concede al confirmarse).
const paymentInReview = computed(() => hasActiveRest.value && eligibility.value?.premium === false)
const canBuy = computed(() => eligibility.value?.flow === 'rest' && !hasActiveRest.value)

async function onSubscribe(planId: number) {
  busyPlan.value = planId
  await subscribe(planId)
  busyPlan.value = null
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : ''
}
</script>

<template>
  <section class="min-h-screen py-12">
    <div class="container mx-auto px-4 md:px-10 xl:px-20">
      <!-- Título -->
      <div class="text-center mb-12">
        <h2 class="t-h1 uppercase">
          Elige tu plan
        </h2>
        <p class="t-body mt-2">
          Accede a los mejores cursos de seguridad informática con el plan que mejor se adapte a ti.
        </p>
      </div>

      <!-- Estado de la cuenta / errores -->
      <div class="max-w-3xl mx-auto mb-8 space-y-3 text-sm">
        <p v-if="paymentInReview" class="rounded-lg border border-warning/40 bg-warning/10 p-4 text-warning">
          Tu suscripción está registrada, pero PayPal está revisando el pago. Tu acceso Premium se activa automáticamente
          cuando lo confirme; no necesitas pagar de nuevo.
        </p>
        <p v-else-if="hasActiveRest" class="rounded-lg border border-success/40 bg-success/10 p-4 text-success">
          Ya tienes una suscripción activa. Puedes gestionarla desde tu perfil.
        </p>
        <div
          v-else-if="eligibility?.legacy_subscription"
          class="rounded-lg border border-border bg-surface-1 p-4 text-foreground"
        >
          <p>
            Tienes un pago recurrente activo con PayPal
            <span v-if="eligibility.legacy_subscription.next_billing_at">
              (próxima renovación: {{ formatDate(eligibility.legacy_subscription.next_billing_at) }})
            </span>.
          </p>
          <template v-if="eligibility.legacy_subscription.can_migrate">
            <p class="mt-2 text-foreground-subtle">
              Puedes pasar a la nueva suscripción sin pagar dos veces: el primer cobro nuevo ocurre en tu fecha de renovación
              y solo cancelamos el pago anterior cuando PayPal confirma la nueva.
            </p>
            <button
              class="bt-btn-primary mt-3"
              :disabled="loading"
              @click="migrate()"
            >
              {{ loading ? 'Redirigiendo a PayPal…' : 'Migrar mi suscripción' }}
            </button>
          </template>
        </div>
        <p
          v-else-if="eligibility && !eligibility.rest_enabled"
          class="rounded-lg border border-border bg-surface-1 p-4 text-foreground-subtle"
        >
          El pago con PayPal aún no está disponible para tu cuenta.
        </p>
        <p v-if="error" class="rounded-lg border border-danger/40 bg-danger/10 p-4 text-danger" role="alert">
          {{ error }}
        </p>
      </div>

      <!-- Grid de Planes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(subscription, i) in subscriptions"
          :key="i"
          class="bt-surface flex flex-col items-center border p-6 shadow-elev-1"
          :class="{
            'border-primary': subscription.recommended === 1,
            'border-subtle': subscription.recommended === 0,
          }"
        >
          <!-- Plan Name -->
          <h3
            class="text-2xl font-semibold font-oswald"
            :class="subscription.recommended === 1 ? 'text-primary-text' : 'text-foreground'"
          >
            {{ subscription.name }}
          </h3>
          <p class="t-body">
            {{ subscription.quantity }} {{ subscription.quantity > 1 ? 'meses' : 'mes' }} de acceso
          </p>
          <span
            class="text-4xl font-bold mt-4 font-oswald"
            :class="subscription.recommended === 1 ? 'text-primary-text' : 'text-foreground'"
          >
            {{ subscription.price }} USD
          </span>

          <!-- Beneficios -->
          <ul class="mt-6 space-y-3 text-foreground text-sm">
            <li class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" /> Acceso a todos los cursos
            </li>
            <li class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" />
              {{ subscription.opportunities }} oportunidades de examen
            </li>

            <!-- Especialidades (Solo si tiene vouchers) -->
            <li v-if="subscription.vouchers > 0" class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" />
              {{ subscription.vouchers }} especialidad{{ subscription.vouchers > 1 ? 'es' : '' }} a elección
            </li>
            <li v-else class="flex items-center text-foreground-subtle">
              <Icon name="lucide:x" class="text-foreground-subtle mr-2" /> Sin acceso a especialidades
            </li>

            <!-- Vouchers -->
            <li v-if="subscription.vouchers > 0" class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" />
              {{ subscription.vouchers }} voucher{{ subscription.vouchers > 1 ? 's' : '' }} de especialidad
            </li>
            <li v-else class="flex items-center text-foreground-subtle">
              <Icon name="lucide:x" class="text-foreground-subtle mr-2" /> Sin vouchers de especialidad
            </li>

            <li class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" /> Certificados de aprobación
            </li>

            <!-- Acompañamiento -->
            <li v-if="subscription.recommended === 1 || subscription.recommended === 0" class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" /> Estudio con acompañamiento
            </li>
            <li v-else class="flex items-center text-foreground-subtle">
              <Icon name="lucide:x" class="text-foreground-subtle mr-2" /> Sin acompañamiento
            </li>

            <!-- Comunidad Discord -->
            <li v-if="subscription.recommended === 1 || subscription.recommended === 0" class="flex items-center">
              <Icon name="lucide:check" class="text-primary-text mr-2" /> Acceso a comunidad en Discord
            </li>
            <li v-else class="flex items-center text-foreground-subtle">
              <Icon name="lucide:x" class="text-foreground-subtle mr-2" /> Sin acceso a Discord
            </li>
          </ul>

          <!-- Botón -->
          <button
            class="mt-6 w-full bt-btn-lg"
            :class="{
              'bt-btn-primary': subscription.recommended === 1,
              'bt-btn-secondary': subscription.recommended === 0,
            }"
            :disabled="!canBuy || loading"
            @click="onSubscribe(subscription.id)"
          >
            {{ busyPlan === subscription.id ? 'Redirigiendo a PayPal…' : 'Suscribirme con PayPal' }}
          </button>
        </div>
      </div>

      <!-- Nota Importante -->
      <p class="text-center text-sm text-foreground-subtle mt-8">
        IMPORTANTE: Si tu pago recurrente está activado, las suscripciones no tienen derecho a reembolso.
        Cualquier duda, contáctanos en <span class="text-primary-text">contacto@backtrackacademy.com</span>.
      </p>
    </div>
  </section>
</template>
