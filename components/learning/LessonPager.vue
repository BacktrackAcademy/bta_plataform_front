<script setup lang="ts">
// Navegación entre clases: "Anterior" discreto, "Siguiente" con la mayor jerarquía de la pantalla.
export interface PagerTarget {
  slug: string
  title: string
  number?: number
  locked?: boolean
}

defineProps<{
  prev?: PagerTarget | null
  next?: PagerTarget | null
  finished: boolean
  courseSlug: string
}>()

const pad = (n?: number) => (n ? `${String(n).padStart(2, '0')} — ` : '')
</script>

<template>
  <nav aria-label="Navegación entre clases" class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
    <NuxtLink
      v-if="prev"
      :to="`/video/${prev.slug}`"
      class="bt-btn-ghost h-auto min-w-0 justify-start gap-2.5 px-3 py-2 text-left sm:max-w-[40%]"
      title="Clase anterior  ·  atajo: ["
    >
      <Icon name="lucide:arrow-left" class="size-4 shrink-0" aria-hidden="true" />
      <span class="min-w-0">
        <span class="t-meta block !text-xs">Clase anterior</span>
        <span class="block truncate text-sm">{{ pad(prev.number) }}{{ prev.title }}</span>
      </span>
    </NuxtLink>
    <span v-else class="hidden sm:block" />

    <div class="flex min-w-0 items-center gap-4 sm:justify-end">
      <p v-if="finished" class="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-success lg:flex">
        <Icon name="lucide:circle-check" class="size-4" aria-hidden="true" />
        Clase completada
      </p>
      <NuxtLink
        v-if="next"
        :to="next.locked ? '/suscripciones' : `/video/${next.slug}`"
        class="bt-btn-primary h-auto min-w-0 flex-1 justify-between gap-4 px-4 py-2.5 text-left sm:max-w-sm sm:flex-none"
        :title="next.locked ? 'Esta clase requiere acceso al curso' : 'Siguiente clase  ·  atajo: ]'"
      >
        <span class="min-w-0">
          <span class="block font-mono text-xs opacity-90">{{ next.locked ? 'Requiere acceso' : finished ? 'Continuar con la siguiente' : 'Siguiente' }}</span>
          <span class="block truncate text-sm font-semibold">{{ pad(next.number) }}{{ next.title }}</span>
        </span>
        <Icon :name="next.locked ? 'lucide:lock' : 'lucide:arrow-right'" class="size-4 shrink-0" aria-hidden="true" />
      </NuxtLink>
      <NuxtLink v-else :to="`/curso/${courseSlug}`" class="bt-btn-secondary flex-1 sm:flex-none">
        <Icon name="lucide:flag" class="size-4" aria-hidden="true" />
        Fin del curso · volver al curso
      </NuxtLink>
    </div>
  </nav>
</template>
