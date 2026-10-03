<script setup lang="ts">
import type { CourseProgress, CoursesProgressResponse } from '~/interfaces/dashboard'
import ContinueMission from '~/components/progress/ContinueMission.vue'
import CourseProgressCard from '~/components/progress/CourseProgressCard.vue'
import ProgressPager from '~/components/progress/ProgressPager.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({
  layout: 'custom',
  auth: true,
  footer: 'compact',
})

useSeoMeta({
  title: 'Mi progreso',
  description: 'Tu ruta de estudio en Backtrack Academy: progreso, cursos activos y certificados.',
})

type Filter = 'in_progress' | 'completed' | 'certified' | 'all'

const PER_PAGE = 6
const MAX_PAGES = 10 // safety cap on the number of API pages fetched

const { $api } = useNuxtApp()
const { percentOf, statusOf } = useCourseProgress()

// TODO(backend): /courses/progress paginates server-side (6/page, ignores per_page) and exposes no global totals,
// so every page is fetched here to get real filters/counts. A single summary endpoint would replace this.
const { data: courses, status, refresh } = useAsyncData<CourseProgress[]>('mi-progreso-courses', async () => {
  const first = await $api<CoursesProgressResponse>('/courses/progress', { query: { page: 1 } })
  const pages = Math.min(first.total_pages ?? 1, MAX_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      $api<CoursesProgressResponse>('/courses/progress', { query: { page: i + 2 } })),
  )
  return [first, ...rest].flatMap(r => r.courses ?? [])
}, { lazy: true, default: () => [] })

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')
const list = computed(() => courses.value ?? [])

const counts = computed(() => ({
  all: list.value.length,
  in_progress: list.value.filter(c => percentOf(c) < 100).length,
  completed: list.value.filter(c => percentOf(c) >= 100).length,
  certified: list.value.filter(c => statusOf(c) === 'certified').length,
}))

// Course to resume: first one already started and unfinished, else first unfinished.
// TODO(backend): expose last_activity_at per course so this is "most recently studied" instead of list order.
const current = computed(() =>
  list.value.find(c => statusOf(c) === 'in_progress')
  ?? list.value.find(c => percentOf(c) < 100),
)

const filters = computed<{ key: Filter, label: string }[]>(() => [
  { key: 'in_progress', label: 'En curso' },
  { key: 'completed', label: 'Completados' },
  { key: 'certified', label: 'Certificados' },
  { key: 'all', label: 'Todos' },
])

const filter = ref<Filter>('in_progress')
const filterTouched = ref(false)
const page = ref(1)

// Default to "Todos" when nothing is in progress, unless the user already picked a tab.
watch(loading, (isLoading) => {
  if (!isLoading && !filterTouched.value && counts.value.in_progress === 0)
    filter.value = 'all'
}, { immediate: true })

function setFilter(key: Filter) {
  filterTouched.value = true
  filter.value = key
  page.value = 1
}

const filtered = computed(() => {
  switch (filter.value) {
    case 'in_progress': return list.value.filter(c => percentOf(c) < 100)
    case 'completed': return list.value.filter(c => percentOf(c) >= 100)
    case 'certified': return list.value.filter(c => statusOf(c) === 'certified')
    default: return list.value
  }
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const visibleCourses = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

const listEl = ref<HTMLElement | null>(null)
function changePage(next: number) {
  page.value = next
  listEl.value?.scrollIntoView({ block: 'start' })
}

const emptyText: Record<Filter, string> = {
  in_progress: 'No tienes cursos en curso.',
  completed: 'Aún no completas ningún curso.',
  certified: 'Aún no tienes certificados. Completa un curso y aprueba su examen.',
  all: 'Aún no has comenzado ningún curso.',
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Mi ruta de estudio" class="animate-rise-in">
      Continúa donde quedaste y completa tu ruta de formación.
      <template #actions>
        <p class="t-meta hidden sm:block" aria-hidden="true">
          <span class="mr-2 inline-block size-1.5 rounded-full bg-success align-middle" />
          <span class="text-primary-text/80">$</span> learning_path --status active
        </p>
      </template>
    </PageHeader>

    <!-- Error -->
    <StateCard v-if="failed" variant="error" title="No pudimos cargar tu progreso" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </StateCard>

    <template v-else>
      <Skeleton v-if="loading" class="h-40 w-full" />
      <ContinueMission v-else-if="current" :course="current" />

      <!-- Learning path -->
      <section ref="listEl" class="scroll-mt-20" aria-labelledby="path-title">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="path-title" class="bt-section-title !text-xl">
            Ruta de aprendizaje
          </h2>
          <div role="group" aria-label="Filtrar cursos" class="flex flex-wrap gap-1.5">
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
        </div>

        <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <Skeleton v-for="n in 3" :key="n" class="h-44" />
        </div>

        <StateCard v-else-if="!visibleCourses.length" :title="emptyText[filter]" icon="lucide:inbox">
          <NuxtLink v-if="filter === 'all' || filter === 'in_progress'" to="/cursos" class="bt-btn-secondary">
            Explorar cursos
          </NuxtLink>
        </StateCard>

        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="course in visibleCourses" :key="course.id">
            <CourseProgressCard :course="course" class="h-full" />
          </li>
        </ul>

        <ProgressPager class="mt-8" :page="page" :total-pages="totalPages" @update:page="changePage" />
      </section>
    </template>
  </div>
</template>
