<script setup lang="ts">
// Bloque de contenido del perfil: encabezado estilo shell (`// titulo`) + cuerpo.
defineProps<{ id: string, title: string, count?: number, shown?: number }>()
</script>

<template>
  <section :id="id" class="scroll-mt-24" :aria-labelledby="`${id}-title`">
    <header class="mb-3.5 flex items-center gap-3">
      <h2 :id="`${id}-title`" class="font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-foreground-secondary">
        <span class="text-primary-text/70" aria-hidden="true">//</span> {{ title }}
      </h2>
      <span class="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" aria-hidden="true" />
      <p v-if="count && shown && count > shown" class="rounded-full border border-border px-2 py-0.5 font-mono text-xs tabular-nums text-foreground-muted">
        {{ shown }} de {{ count }}
      </p>
    </header>
    <slot />
  </section>
</template>
