<script setup lang="ts">
// Puntaje + puesto en el topbar: enlaza al ranking. Se actualiza en cada cambio de ruta.
const { score, refresh } = useScore()
const route = useRoute()
const nf = new Intl.NumberFormat('es')

onMounted(refresh)
watch(() => route.path, refresh)
</script>

<template>
  <NuxtLink
    v-if="score"
    to="/ranking"
    class="bt-focus inline-flex h-9 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 font-mono text-sm text-primary-text transition-colors hover:bg-primary/15"
    :title="score.position ? `Puesto #${nf.format(score.position)} en el ranking` : 'Ver el ranking'"
    :aria-label="`Tu puntaje: ${nf.format(score.score)} puntos. Ver ranking`"
  >
    <Icon name="lucide:trophy" class="size-4" aria-hidden="true" />
    <span class="tabular-nums">{{ nf.format(score.score) }}</span>
    <span class="hidden text-foreground-muted sm:inline">pts</span>
    <span v-if="score.position" class="hidden text-foreground-muted md:inline">· #{{ nf.format(score.position) }}</span>
  </NuxtLink>
</template>
