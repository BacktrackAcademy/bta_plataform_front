<script setup lang="ts">
definePageMeta({
  layout: 'custom',
  auth: true,
})
</script>

<template>
  <section class="min-h-screen py-12">
    <div class="container mx-auto px-4 max-w-xl text-center text-foreground">
      <div class="bt-surface p-8">
        <Icon name="lucide:circle-slash" class="size-10 text-foreground-subtle mx-auto" />
        <h2 class="mt-4 text-2xl font-semibold font-oswald uppercase">
          Cancelaste el pago
        </h2>
        <p class="mt-2 t-small">
          No se realizó ningún cobro. Puedes volver a elegir un plan cuando quieras.
        </p>
        <NuxtLink to="/suscripciones" class="bt-btn-primary bt-btn-lg mt-6">
          Volver a los planes
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
