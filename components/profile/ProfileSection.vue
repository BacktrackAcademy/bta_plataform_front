<script setup lang="ts">
// Bloque de contenido del perfil: encabezado estilo shell (`// titulo`) + cuerpo.
defineProps<{ id: string, title: string, count?: number, shown?: number }>()
</script>

<template>
  <section :id="id" class="scroll-mt-24" :aria-labelledby="`${id}-title`">
    <header class="mb-3 flex items-baseline justify-between gap-3">
      <h2 :id="`${id}-title`" class="font-inconsolata text-xs uppercase tracking-[0.18em] text-bta-text-2">
        <span class="text-bta-pink/70" aria-hidden="true">//</span> {{ title }}
      </h2>
      <p v-if="count && shown && count > shown" class="font-inconsolata text-xs text-gray-muted">
        {{ shown }} de {{ count }}
      </p>
    </header>
    <slot />
  </section>
</template>
