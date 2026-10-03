<script setup lang="ts">
// Bloque de contenido del perfil: encabezado estilo shell (`// titulo`) + cuerpo.
defineProps<{ id: string, title: string, count?: number, shown?: number }>()
</script>

<template>
  <section :id="id" class="scroll-mt-24" :aria-labelledby="`${id}-title`">
    <header class="mb-3.5 flex items-center gap-3">
      <h2 :id="`${id}-title`" class="font-inconsolata text-xs font-bold uppercase tracking-[0.2em] text-white/80">
        <span class="text-bta-pink/70" aria-hidden="true">//</span> {{ title }}
      </h2>
      <span class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" aria-hidden="true" />
      <p v-if="count && shown && count > shown" class="rounded-full border border-white/10 px-2 py-0.5 font-inconsolata text-[11px] tabular-nums text-gray-muted">
        {{ shown }} de {{ count }}
      </p>
    </header>
    <slot />
  </section>
</template>
