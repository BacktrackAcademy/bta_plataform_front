<script setup lang="ts">
// Cabecera de página autenticada: título de sección (Oswald + guion magenta), descripción y acciones.
defineProps<{ title: string }>()
</script>

<template>
  <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <h1 class="bt-section-title">
        {{ title }}
      </h1>
      <p v-if="$slots.default" class="t-small mt-2">
        <slot />
      </p>
    </div>
    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>
