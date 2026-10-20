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
}

const route = useRoute()
const { data: subscriptions, status } = useAPI<Subscription[]>('/subscriptions')
const { data: addons } = useAPI<Addon[]>('/landing/addons')
const { data: eligibility } = useAPI<PaypalEligibility>('/paypal/eligibility')
const { loading: subLoading, error: subError, subscribe } = usePaypalSubscription()
const { loading: orderLoading, error: orderError, buy } = usePaypalOrder()
const { coupon, loading: couponLoading, error: couponError, apply, remove } = useCoupon()
const { cart, setPlan, setQuantity, MAX_QUANTITY } = useCart()

// Llegar con ?plan=ID (desde Planes o desde el sitio público) deja ese plan en el carrito.
if (route.query.plan)
  setPlan(Number(route.query.plan) || null)

const plan = computed(() => subscriptions.value?.find(s => s.id === cart.value.plan))
const lines = computed(() => (addons.value ?? [])
  .filter(a => cart.value.addons[a.id])
  .map(a => ({ addon: a, qty: cart.value.addons[a.id] })))
const addonsTotal = computed(() => lines.value.reduce((sum, l) => sum + l.addon.price * l.qty, 0))
const code = ref('')

const hasActiveRest = computed(() =>
  ['active', 'suspended'].includes(eligibility.value?.rest_subscription?.status ?? ''))
const canBuySub = computed(() => eligibility.value?.flow === 'rest' && !hasActiveRest.value)
const canBuyAddons = computed(() => eligibility.value?.rest_enabled === true)
const loading = computed(() => subLoading.value || orderLoading.value)
const error = computed(() => subError.value || orderError.value)
const empty = computed(() => !plan.value && !lines.value.length)

const discount = computed(() => plan.value && coupon.value ? plan.value.price * coupon.value.discount_rate / 100 : 0)
const subTotal = computed(() => plan.value ? plan.value.price - discount.value : 0)
const total = computed(() => subTotal.value + addonsTotal.value)
const months = computed(() => plan.value ? `${plan.value.quantity} ${plan.value.quantity > 1 ? 'meses' : 'mes'}` : '')
// Con packs en el carrito se paga en dos pasos: primero los packs, luego la suscripción.
const twoSteps = computed(() => !!plan.value && lines.value.length > 0)
const canPay = computed(() => lines.value.length ? canBuyAddons.value : canBuySub.value)

const usd = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2)} USD`

// El descuento tiene fecha de vencimiento: cuenta regresiva y, al llegar a cero, se retira solo.
const couponExpiresAt = computed(() => coupon.value?.expires_at ?? null)
const { label: countdown, expired: couponExpired } = useCountdown(couponExpiresAt)
watch(couponExpired, (isExpired) => {
  if (isExpired) {
    remove()
    couponError.value = 'El cupón venció.'
  }
})

async function onApply() {
  await apply(code.value)
  if (coupon.value)
    code.value = ''
}

async function onPay() {
  if (lines.value.length) {
    await buy(lines.value.map(l => ({ product_id: l.addon.id, quantity: l.qty })))
    return
  }
  if (plan.value)
    await subscribe(plan.value.id, coupon.value?.code)
}

function removePlan() {
  setPlan(null)
  remove()
}
</script>

<template>
  <section class="min-h-screen py-10">
    <div class="container mx-auto px-4 md:px-10 xl:px-20">
      <!-- Pasos: el carrito es el segundo -->
      <nav class="mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-foreground-subtle" aria-label="Pasos">
        <NuxtLink to="/suscripciones" class="hover:text-foreground">
          1. Plan
        </NuxtLink>
        <Icon name="lucide:chevron-right" class="size-3" />
        <span class="text-primary-text font-semibold">2. Carrito</span>
        <Icon name="lucide:chevron-right" class="size-3" />
        <span>3. Pago</span>
      </nav>

      <div class="mb-8 flex items-center gap-3">
        <Icon name="lucide:shopping-cart" class="size-8 text-primary-text" />
        <div>
          <h2 class="t-h1 uppercase leading-none">
            Mi carrito
          </h2>
          <p class="t-body mt-1">
            Revisa tu plan y tus packs, aplica tu cupón y confirma la compra.
          </p>
        </div>
      </div>

      <p v-if="status === 'pending'" class="t-body">
        Cargando…
      </p>

      <!-- Carrito vacío / plan inexistente -->
      <div v-else-if="empty" class="bt-surface p-10 text-center">
        <Icon name="lucide:shopping-cart" class="size-10 text-foreground-subtle mx-auto" />
        <h3 class="mt-4 text-2xl font-semibold font-oswald uppercase text-foreground">
          Tu carrito está vacío
        </h3>
        <p class="mt-2 t-small">
          Elige un plan o añade oportunidades y vouchers para continuar.
        </p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/suscripciones" class="bt-btn-primary bt-btn-lg">
            Ver planes
          </NuxtLink>
          <NuxtLink to="/suscripciones/extras" class="bt-btn-secondary bt-btn-lg">
            Oportunidades y vouchers
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <!-- Carrito: producto + cupón en una sola tarjeta -->
        <div class="space-y-6">
          <div v-if="plan" class="bt-surface border border-subtle shadow-elev-1">
            <div class="flex items-start justify-between gap-4 p-6">
              <div class="min-w-0">
                <span class="bt-badge bt-badge-primary">Suscripción</span>
                <h3 class="mt-2 text-3xl font-semibold font-oswald text-primary-text">
                  {{ plan.name }}
                </h3>
                <p class="t-body mt-1">
                  {{ months }} de acceso · se renueva cada {{ months }}
                </p>
              </div>
              <div class="flex shrink-0 items-start gap-3">
                <span class="whitespace-nowrap text-2xl font-bold font-oswald text-foreground">{{ usd(plan.price) }}</span>
                <button
                  type="button"
                  class="mt-1 text-foreground-subtle hover:text-foreground"
                  title="Quitar del carrito"
                  aria-label="Quitar la suscripción del carrito"
                  @click="removePlan"
                >
                  <Icon name="lucide:trash-2" />
                </button>
              </div>
            </div>

            <div class="border-t border-subtle px-6 py-5">
              <h4 class="text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
                ¿Qué estás comprando?
              </h4>
              <ul class="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                <li class="flex items-start gap-2">
                  <Icon name="lucide:check" class="mt-0.5 shrink-0 text-primary-text" /> Acceso a todos los cursos y contenidos avanzados
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="lucide:check" class="mt-0.5 shrink-0 text-primary-text" /> Más opciones de personalización en tu perfil
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="lucide:check" class="mt-0.5 shrink-0 text-primary-text" /> Ayudas a que la comunidad siga creciendo
                </li>
              </ul>
            </div>

            <!-- Cupón -->
            <div class="border-t border-subtle px-6 py-5">
              <h4 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
                <Icon name="lucide:ticket-percent" class="size-4" /> ¿Tienes un cupón de descuento?
              </h4>

              <div
                v-if="coupon"
                class="mt-3 rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success"
              >
                <div class="flex items-center justify-between gap-4">
                  <p>
                    Cupón <b>{{ coupon.code }}</b> aplicado: {{ coupon.discount_rate }}% de descuento.
                  </p>
                  <button type="button" class="underline" @click="remove()">
                    Quitar
                  </button>
                </div>
                <p v-if="countdown" class="mt-2 flex items-center gap-2" aria-live="off">
                  <Icon name="lucide:timer" /> Este descuento vence en
                  <span class="font-oswald text-lg tabular-nums">{{ countdown }}</span>
                </p>
              </div>

              <form v-else class="mt-3 flex flex-col gap-3 sm:flex-row" @submit.prevent="onApply">
                <input
                  v-model="code"
                  type="text"
                  class="bt-input min-w-0 w-full sm:flex-1"
                  placeholder="Código de cupón"
                  aria-label="Código de cupón"
                  autocomplete="off"
                >
                <button type="submit" class="bt-btn-secondary whitespace-nowrap" :disabled="couponLoading || !code.trim()">
                  {{ couponLoading ? 'Validando…' : 'Aplicar descuento' }}
                </button>
              </form>
              <p v-if="couponError" class="mt-2 text-sm text-danger" role="alert">
                {{ couponError }}
              </p>
            </div>
          </div>

          <!-- Oportunidades y vouchers -->
          <div v-if="lines.length" class="bt-surface border border-subtle shadow-elev-1">
            <div class="flex items-center justify-between gap-4 px-6 pt-5">
              <span class="bt-badge bt-badge-primary">Compra única</span>
              <NuxtLink to="/suscripciones/extras" class="text-sm text-foreground-subtle hover:text-foreground">
                Añadir más
              </NuxtLink>
            </div>
            <ul class="divide-y divide-subtle">
              <li v-for="l in lines" :key="l.addon.id" class="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div class="min-w-0">
                  <p class="font-oswald text-lg text-foreground">
                    {{ l.addon.name }}
                  </p>
                  <p class="t-small">
                    {{ usd(l.addon.price) }} c/u
                  </p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2" role="group" :aria-label="`Cantidad de ${l.addon.name}`">
                    <button type="button" class="bt-btn-secondary px-3" aria-label="Quitar uno" @click="setQuantity(l.addon.id, l.qty - 1)">
                      −
                    </button>
                    <span class="w-6 text-center tabular-nums" aria-live="polite">{{ l.qty }}</span>
                    <button type="button" class="bt-btn-secondary px-3" aria-label="Añadir uno" :disabled="l.qty >= MAX_QUANTITY" @click="setQuantity(l.addon.id, l.qty + 1)">
                      +
                    </button>
                  </div>
                  <span class="w-24 whitespace-nowrap text-right text-lg font-bold font-oswald text-foreground">{{ usd(l.addon.price * l.qty) }}</span>
                  <button type="button" class="text-foreground-subtle hover:text-foreground" aria-label="Quitar del carrito" @click="setQuantity(l.addon.id, 0)">
                    <Icon name="lucide:trash-2" />
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <NuxtLink v-if="!plan" to="/suscripciones" class="bt-surface flex items-center justify-between gap-4 border border-subtle p-5 text-sm text-foreground hover:border-primary">
            <span>¿Quieres añadir un plan con acceso a todos los cursos?</span>
            <span class="text-primary-text">Ver planes</span>
          </NuxtLink>
        </div>

        <!-- Resumen -->
        <aside class="bt-surface h-fit space-y-4 border border-primary p-6 lg:sticky lg:top-6">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
            Resumen
          </h4>
          <dl class="space-y-2 text-sm text-foreground">
            <div v-if="plan" class="flex justify-between gap-4">
              <dt>{{ plan.name }}</dt>
              <dd class="whitespace-nowrap">
                {{ usd(plan.price) }}
              </dd>
            </div>
            <div v-for="l in lines" :key="l.addon.id" class="flex justify-between gap-4">
              <dt>{{ l.qty }} × {{ l.addon.name }}</dt>
              <dd class="whitespace-nowrap">
                {{ usd(l.addon.price * l.qty) }}
              </dd>
            </div>
            <div v-if="coupon" class="flex justify-between gap-4 text-success">
              <dt>Descuento ({{ coupon.discount_rate }}%)</dt>
              <dd class="whitespace-nowrap">
                -{{ usd(discount) }}
              </dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 border-t border-subtle pt-3">
              <dt class="text-lg font-bold">
                Total
              </dt>
              <dd class="whitespace-nowrap text-3xl font-bold font-oswald text-primary-text">
                {{ usd(total) }}
              </dd>
            </div>
          </dl>

          <p v-if="twoSteps" class="rounded-lg border border-border bg-surface-1 p-3 text-sm text-foreground-subtle">
            Pagarás en dos pasos: primero {{ usd(addonsTotal) }} en oportunidades y vouchers, y a continuación
            tu suscripción ({{ usd(subTotal) }}).
          </p>
          <p v-if="plan && hasActiveRest && !lines.length" class="text-sm text-success">
            Ya tienes una suscripción activa. Puedes gestionarla desde tu perfil.
          </p>
          <p v-else-if="eligibility && !canPay" class="text-sm text-foreground-subtle">
            El pago con PayPal aún no está disponible para tu cuenta.
          </p>
          <p v-if="error" class="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger" role="alert">
            {{ error }}
          </p>

          <button
            class="w-full bt-btn-lg bt-btn-primary"
            :disabled="!canPay || loading"
            @click="onPay"
          >
            {{ loading ? 'Redirigiendo a PayPal…' : (twoSteps ? 'Pagar packs con PayPal (paso 1 de 2)' : 'Pagar con PayPal') }}
          </button>
          <NuxtLink to="/suscripciones" class="block text-center text-sm text-foreground-subtle hover:text-foreground">
            {{ plan ? 'Cambiar de plan' : 'Ver planes' }}
          </NuxtLink>
          <p class="border-t border-subtle pt-4 text-xs text-foreground-subtle">
            Si tu pago recurrente está activado, las suscripciones no tienen derecho a reembolso. Dudas:
            <span class="text-primary-text">contacto@backtrackacademy.com</span>.
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>
