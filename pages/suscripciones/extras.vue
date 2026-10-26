<script setup lang="ts">
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const route = useRoute()
const { data: addons, status } = useAPI<Addon[]>('/landing/addons')
const { cart, count, addAddon } = useCart()
const justAdded = ref<number | null>(null)

const highlighted = computed(() => Number(route.query.producto) || null)

const groups = computed(() => [
  {
    key: 'opportunities',
    title: 'Oportunidades para exámenes',
    text: 'Cada examen que rindes al terminar un curso gasta una oportunidad.',
    items: (addons.value ?? []).filter(a => a.kind === 'opportunities'),
  },
  {
    key: 'vouchers',
    title: 'Vouchers de especialidad',
    text: 'Un voucher te permite rendir el examen final de una especialidad.',
    items: (addons.value ?? []).filter(a => a.kind === 'vouchers'),
  },
].filter(g => g.items.length))

function onAdd(a: Addon) {
  addAddon(a.id)
  justAdded.value = a.id
}
function amount(a: Addon) {
  return a.kind === 'vouchers' ? a.vouchers : a.opportunities
}
function unitPrice(a: Addon) {
  const n = amount(a)
  return n > 1 ? (a.price / n).toFixed(2).replace(/\.00$/, '') : null
}
</script>

<template>
  <section class="min-h-screen">
    <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <PageHeader title="Oportunidades y vouchers" class="mb-10">
        Compra más intentos de examen o vouchers de especialidad, sin cambiar tu plan. Pago con PayPal.
      </PageHeader>

      <div class="mx-auto mb-8 max-w-3xl space-y-3 text-sm">
        <NuxtLink
          v-if="count"
          to="/suscripciones/carrito"
          class="bt-btn-primary bt-btn-lg w-full"
        >
          <Icon name="lucide:shopping-cart" /> Ver carrito ({{ count }})
        </NuxtLink>
      </div>

      <p v-if="status === 'pending'" class="t-body text-center">
        Cargando…
      </p>
      <p v-else-if="!groups.length" class="t-body text-center">
        No hay productos disponibles por ahora.
      </p>

      <div v-for="g in groups" :key="g.key" class="mb-12">
        <h3 class="text-2xl font-semibold font-oswald uppercase text-foreground">
          {{ g.title }}
        </h3>
        <p class="t-small mb-5 mt-1">
          {{ g.text }}
        </p>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            v-for="a in g.items"
            :key="a.id"
            class="bt-surface flex flex-col items-center border p-6 shadow-elev-1"
            :class="highlighted === a.id ? 'border-primary' : 'border-subtle'"
          >
            <h4 class="text-xl font-semibold font-oswald text-foreground">
              {{ a.name }}
            </h4>
            <span class="mt-4 text-4xl font-bold font-oswald text-foreground">{{ a.price }} USD</span>
            <span v-if="a.price < a.old_price" class="t-small mt-1">
              Antes <del>{{ a.old_price }} USD</del> · ahorras {{ a.discount_percent }}%
            </span>
            <span v-else-if="unitPrice(a)" class="t-small mt-1">{{ unitPrice(a) }} USD c/u</span>
            <button
              class="mt-6 w-full bt-btn-lg"
              :class="highlighted === a.id ? 'bt-btn-primary' : 'bt-btn-secondary'"
              @click="onAdd(a)"
            >
              <Icon name="lucide:shopping-cart" />
              Añadir al carrito
              <span v-if="cart.addons[a.id]" class="ml-1 rounded bg-white/10 px-1.5 text-xs">{{ cart.addons[a.id] }}</span>
            </button>
            <p v-if="justAdded === a.id" class="mt-2 text-xs text-success" role="status">
              Añadido. <NuxtLink to="/suscripciones/carrito" class="underline">
                Ver carrito
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <p class="mt-8 text-center text-sm text-foreground-subtle">
        Se acreditan en tu cuenta apenas PayPal confirma el pago. ¿Dudas? Escríbenos a
        <span class="text-primary-text">contacto@backtrackacademy.com</span>.
      </p>
    </div>
  </section>
</template>
