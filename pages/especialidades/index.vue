<script setup lang="ts">
import type { SpecialtyCard as Specialty, SpecialtyStatus } from '~/interfaces/specialties'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import SpecialtyCard from '~/components/specialties/SpecialtyCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({
  title: 'Especialidades',
  description: 'Rutas completas de ciberseguridad: tu avance, los cursos de cada especialidad y su examen final.',
  robots: 'noindex, nofollow',
})

type Filter = 'all' | 'in_progress' | 'completed' | 'not_started'

const { data, status, refresh } = useAPI<{ data: Specialty[] }>('/specialties', { lazy: true })

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')
const list = computed(() => (data.value?.data ?? []).filter(s => s.courses_count > 0))

const FILTER_STATUSES: Record<Filter, SpecialtyStatus[] | null> = {
  all: null,
  in_progress: ['in_progress'],
  completed: ['completed', 'certified'],
  not_started: ['not_started'],
}
const filters: { key: Filter, label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'in_progress', label: 'En curso' },
  { key: 'completed', label: 'Completadas' },
  { key: 'not_started', label: 'Por empezar' },
]

function inFilter(s: Specialty, key: Filter) {
  const allowed = FILTER_STATUSES[key]
  return !allowed || allowed.includes(s.progress.status)
}

const filter = ref<Filter>('all')
const counts = computed(() => Object.fromEntries(filters.map(f => [f.key, list.value.filter(s => inFilter(s, f.key)).length])) as Record<Filter, number>)
const visible = computed(() => list.value.filter(s => inFilter(s, filter.value)))

// Si ya está avanzando en alguna, esa pestaña es la más útil; el alumno puede cambiarla.
const touched = ref(false)
watch(loading, (isLoading) => {
  if (!isLoading && !touched.value && counts.value.in_progress > 0)
    filter.value = 'in_progress'
}, { immediate: true })

function setFilter(key: Filter) {
  touched.value = true
  filter.value = key
}

const emptyText: Record<Filter, string> = {
  all: 'Aún no hay especialidades disponibles.',
  in_progress: 'No tienes especialidades en curso.',
  completed: 'Aún no completas ninguna especialidad.',
  not_started: 'Ya empezaste todas las especialidades.',
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Especialidades" class="animate-rise-in">
      Rutas completas con los cursos en orden, tu avance y el examen final de cada una.
      <template #actions>
        <NuxtLink to="/examenes" class="bt-btn-secondary">
          <Icon name="lucide:file-check-2" class="size-4" aria-hidden="true" />
          Mis exámenes
        </NuxtLink>
      </template>
    </PageHeader>

    <StateCard v-if="failed" variant="error" title="No pudimos cargar las especialidades" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </StateCard>

    <template v-else>
      <div role="group" aria-label="Filtrar especialidades" class="flex flex-wrap gap-1.5">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          :aria-pressed="filter === f.key"
          class="bt-chip"
          @click="setFilter(f.key)"
        >
          {{ f.label }}
          <span v-if="!loading" class="font-mono text-xs text-foreground-subtle" :class="{ '!text-primary-text': filter === f.key }">{{ counts[f.key] }}</span>
        </button>
      </div>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        <Skeleton v-for="n in 3" :key="n" class="h-72" />
      </div>
      <StateCard v-else-if="!visible.length" :title="emptyText[filter]" icon="lucide:inbox">
        <NuxtLink v-if="filter !== 'all'" to="/especialidades" class="bt-btn-secondary" @click.prevent="setFilter('all')">
          Ver todas
        </NuxtLink>
      </StateCard>
      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="s in visible" :key="s.slug">
          <SpecialtyCard :specialty="s" class="h-full" />
        </li>
      </ul>
    </template>
  </div>
</template>
