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

const { data: subscriptions, status: subscriptionStatus } = useAPI<Subscription[]>('/subscriptions')
const { data: eligibility } = useAPI<PaypalEligibility>('/paypal/eligibility')
const { loading, error, subscribe, migrate } = usePaypalSubscription()

const busyPlan = ref<number | null>(null)

const hasActiveRest = computed(() =>
  ['active', 'suspended'].includes(eligibility.value?.rest_subscription?.status ?? ''))
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
  <section class="min-h-screen bg-bta-section py-12">
    <div class="container mx-auto px-4 md:px-10 xl:px-20">
      <!-- Título -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-semibold text-white font-oswald uppercase">
          Elige tu plan
        </h2>
        <p class="text-gray-muted text-lg font-inconsolata mt-2">
          Accede a los mejores cursos de seguridad informática con el plan que mejor se adapte a ti.
        </p>
      </div>

      <!-- Estado de la cuenta / errores -->
      <div class="max-w-3xl mx-auto mb-8 space-y-3 font-inconsolata text-sm">
        <p v-if="hasActiveRest" class="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-400">
          Ya tienes una suscripción activa. Puedes gestionarla desde tu perfil.
        </p>
        <div
          v-else-if="eligibility?.legacy_subscription"
          class="rounded-lg border border-gray-600 bg-bta-dark-blue p-4 text-white"
        >
          <p>
            Tienes un pago recurrente activo con PayPal
            <span v-if="eligibility.legacy_subscription.next_billing_at">
              (próxima renovación: {{ formatDate(eligibility.legacy_subscription.next_billing_at) }})
            </span>.
          </p>
          <template v-if="eligibility.legacy_subscription.can_migrate">
            <p class="mt-2 text-gray-muted">
              Puedes pasar a la nueva suscripción sin pagar dos veces: el primer cobro nuevo ocurre en tu fecha de renovación
              y solo cancelamos el pago anterior cuando PayPal confirma la nueva.
            </p>
            <button
              class="mt-3 py-2 px-4 bg-bta-pink hover:bg-bta-pink/90 text-white font-semibold rounded-lg disabled:opacity-50"
              :disabled="loading"
              @click="migrate()"
            >
              {{ loading ? 'Redirigiendo a PayPal…' : 'Migrar mi suscripción' }}
            </button>
          </template>
        </div>
        <p
          v-else-if="eligibility && !eligibility.rest_enabled"
          class="rounded-lg border border-gray-600 bg-bta-dark-blue p-4 text-gray-muted"
        >
          El pago con PayPal aún no está disponible para tu cuenta.
        </p>
        <p v-if="error" class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-400" role="alert">
          {{ error }}
        </p>
      </div>

      <!-- Grid de Planes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(subscription, i) in subscriptions"
          :key="i"
          class="bg-bta-dark-blue border p-6 rounded-lg shadow-lg flex flex-col items-center"
          :class="{
            'border-bta-pink': subscription.recommended === 1,
            'border-gray-600': subscription.recommended === 0,
          }"
        >
          <!-- Plan Name -->
          <h3
            class="text-2xl font-semibold font-oswald"
            :class="subscription.recommended === 1 ? 'text-bta-pink' : 'text-white'"
          >
            {{ subscription.name }}
          </h3>
          <p class="text-gray-muted text-lg font-inconsolata">
            {{ subscription.quantity }} {{ subscription.quantity > 1 ? 'meses' : 'mes' }} de acceso
          </p>
          <span
            class="text-4xl font-bold mt-4 font-oswald"
            :class="subscription.recommended === 1 ? 'text-bta-pink' : 'text-white'"
          >
            {{ subscription.price }} USD
          </span>

          <!-- Beneficios -->
          <ul class="mt-6 space-y-3 text-white font-inconsolata text-sm">
            <li class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" /> Acceso a todos los cursos
            </li>
            <li class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" />
              {{ subscription.opportunities }} oportunidades de examen
            </li>

            <!-- Especialidades (Solo si tiene vouchers) -->
            <li v-if="subscription.vouchers > 0" class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" />
              {{ subscription.vouchers }} especialidad{{ subscription.vouchers > 1 ? 'es' : '' }} a elección
            </li>
            <li v-else class="flex items-center text-gray-muted">
              <Icon name="lucide:x" class="text-gray-muted mr-2" /> Sin acceso a especialidades
            </li>

            <!-- Vouchers -->
            <li v-if="subscription.vouchers > 0" class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" />
              {{ subscription.vouchers }} voucher{{ subscription.vouchers > 1 ? 's' : '' }} de especialidad
            </li>
            <li v-else class="flex items-center text-gray-muted">
              <Icon name="lucide:x" class="text-gray-muted mr-2" /> Sin vouchers de especialidad
            </li>

            <li class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" /> Certificados de aprobación
            </li>

            <!-- Acompañamiento -->
            <li v-if="subscription.recommended === 1 || subscription.recommended === 0" class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" /> Estudio con acompañamiento
            </li>
            <li v-else class="flex items-center text-gray-muted">
              <Icon name="lucide:x" class="text-gray-muted mr-2" /> Sin acompañamiento
            </li>

            <!-- Comunidad Discord -->
            <li v-if="subscription.recommended === 1 || subscription.recommended === 0" class="flex items-center">
              <Icon name="lucide:check" class="text-bta-pink mr-2" /> Acceso a comunidad en Discord
            </li>
            <li v-else class="flex items-center text-gray-muted">
              <Icon name="lucide:x" class="text-gray-muted mr-2" /> Sin acceso a Discord
            </li>
          </ul>

          <!-- Botón -->
          <button
            class="mt-6 w-full py-3 text-white font-semibold rounded-lg transition-all font-inconsolata disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'bg-bta-pink hover:bg-bta-pink/90': subscription.recommended === 1,
              'bg-bta-blue hover:bg-bta-blue/90': subscription.recommended === 0,
            }"
            :disabled="!canBuy || loading"
            @click="onSubscribe(subscription.id)"
          >
            {{ busyPlan === subscription.id ? 'Redirigiendo a PayPal…' : 'Suscribirme con PayPal' }}
          </button>
        </div>
      </div>

      <!-- Nota Importante -->
      <p class="text-center text-sm text-gray-muted mt-8 font-inconsolata">
        IMPORTANTE: Si tu pago recurrente está activado, las suscripciones no tienen derecho a reembolso.
        Cualquier duda, contáctanos en <span class="text-bta-pink">contacto@backtrackacademy.com</span>.
      </p>
    </div>
  </section>
</template>
