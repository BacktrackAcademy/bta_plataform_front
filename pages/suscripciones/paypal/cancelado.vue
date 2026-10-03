<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})
</script>

<template>
  <section class="min-h-screen bg-bta-section py-12">
    <div class="container mx-auto px-4 max-w-xl text-center text-white">
      <div class="bg-bta-dark-blue rounded-lg shadow-lg p-8">
        <Icon name="lucide:circle-slash" class="size-10 text-gray-muted mx-auto" />
        <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
          Cancelaste el pago
        </h2>
        <p class="mt-2 text-gray-muted font-inconsolata text-sm">
          No se realizó ningún cobro. Puedes volver a elegir un plan cuando quieras.
        </p>
        <NuxtLink to="/suscripciones" class="inline-block mt-6 py-3 px-6 bg-bta-pink hover:bg-bta-pink/90 rounded-lg font-semibold font-inconsolata">
          Volver a los planes
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
