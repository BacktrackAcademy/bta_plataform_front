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
  <!-- Saludo deliberadamente discreto: la protagonista del dashboard es la tarjeta "Continuar curso" -->
  <header>
    <h1 class="font-oswald text-2xl font-medium leading-tight text-foreground-secondary sm:text-[1.75rem]">
      {{ greeting }}<span v-if="firstName">, <span class="text-foreground">{{ firstName }}</span></span>
    </h1>
  </header>
</template>
