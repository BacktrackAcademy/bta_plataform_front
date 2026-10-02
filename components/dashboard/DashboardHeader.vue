<script setup lang="ts">
const { data: session } = useAuth()

// Computed on the client only so SSR and hydration agree regardless of timezone.
const greeting = ref('Hola')
onMounted(() => {
  const h = new Date().getHours()
  greeting.value = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
})

const firstName = computed(() => session.value?.user?.name?.split(' ')[0] ?? '')
</script>

<template>
  <header class="relative overflow-hidden rounded-xl border border-white/[0.06] bg-bta-surface px-6 py-6 sm:px-8">
    <div class="bt-tech-grid pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_85%_0%,#000_0%,transparent_70%)]" aria-hidden="true" />
    <div class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-bta-pink/10 blur-3xl" aria-hidden="true" />

    <div class="relative">
      <h1 class="font-oswald text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {{ greeting }}<template v-if="firstName">
          , {{ firstName }}
        </template>
      </h1>
      <p class="mt-1.5 text-[15px] text-bta-text-2">
        Continúa donde lo dejaste.
      </p>
    </div>
  </header>
</template>
