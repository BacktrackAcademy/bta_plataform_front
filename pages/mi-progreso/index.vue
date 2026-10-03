<script setup lang="ts">
import type { CourseProgress, CoursesHistory, CoursesProgressResponse } from '~/interfaces/dashboard'
import ContinueMission from '~/components/progress/ContinueMission.vue'
import CourseProgressCard from '~/components/progress/CourseProgressCard.vue'
import ProgressPager from '~/components/progress/ProgressPager.vue'
import ProgressSummary from '~/components/progress/ProgressSummary.vue'
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
const { clockToHours } = useFormatter()

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

const { data: history } = useAsyncData<CoursesHistory>('mi-progreso-history', () => $api<CoursesHistory>('/courses/history'), { lazy: true })

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')
const list = computed(() => courses.value ?? [])

const counts = computed(() => ({
  all: list.value.length,
  in_progress: list.value.filter(c => percentOf(c) < 100).length,
  completed: list.value.filter(c => percentOf(c) >= 100).length,
  certified: list.value.filter(c => statusOf(c) === 'certified').length,
}))

const lessonsDone = computed(() => list.value.reduce((sum, c) => sum + (c.count_video ?? 0), 0))
const lessonsTotal = computed(() => list.value.reduce((sum, c) => sum + (c.number_videos ?? 0), 0))
// Backend `progress_percentage` reads 0 for real users; lessons done / total is the reliable figure.
const overallPercent = computed(() => lessonsTotal.value ? Math.round((lessonsDone.value / lessonsTotal.value) * 100) : 0)
const studyHours = computed(() => history.value ? clockToHours(history.value.total_viewed) : null)

const summaryStats = computed(() => [
  { key: 'courses', label: 'Cursos', value: history.value?.number_courses ?? counts.value.all },
  { key: 'completed', label: 'Completados', value: counts.value.completed },
  { key: 'certs', label: 'Certificados', value: counts.value.certified },
  { key: 'lessons', label: 'Lecciones', value: lessonsDone.value, unit: `/ ${lessonsTotal.value}` },
  { key: 'hours', label: 'Estudio', value: studyHours.value, unit: 'h' },
])

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
    <!-- Header -->
    <header class="animate-rise-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="bt-section-title">
          Mi ruta de estudio
        </h1>
        <p class="mt-2 font-inconsolata text-sm text-bta-text-2">
          Continúa donde quedaste y completa tu ruta de formación.
        </p>
      </div>
      <p class="font-inconsolata text-xs text-gray-muted" aria-hidden="true">
        <span class="mr-2 inline-block size-1.5 rounded-full bg-emerald-400 align-middle" />
        <span class="text-bta-pink/80">$</span> learning_path --status active
      </p>
    </header>

    <!-- Error -->
    <section v-if="failed" class="bt-surface flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div>
        <p class="font-oswald text-lg text-white">
          No pudimos cargar tu progreso
        </p>
        <p class="mt-1 text-sm text-bta-text-2">
          Revisa tu conexión e inténtalo de nuevo.
        </p>
      </div>
      <button
        type="button"
        class="bt-focus inline-flex h-10 items-center gap-2 rounded-md border border-white/15 px-4 text-sm font-medium text-white transition-colors hover:border-bta-pink/60 hover:text-bta-pink"
        @click="refresh()"
      >
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </section>

    <template v-else>
      <ProgressSummary
        :percent="overallPercent"
        :stats="summaryStats"
        :loading="loading"
      />

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
              class="bt-focus inline-flex h-8 items-center gap-2 border px-3 font-inconsolata text-xs uppercase tracking-wider transition-colors"
              :class="filter === f.key ? 'border-bta-pink bg-bta-pink/10 text-white' : 'border-white/[0.06] text-bta-text-2 hover:border-white/20 hover:text-white'"
              @click="setFilter(f.key)"
            >
              {{ f.label }}
              <span v-if="!loading" class="text-gray-muted" :class="{ '!text-bta-pink': filter === f.key }">{{ counts[f.key] }}</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <Skeleton v-for="n in 3" :key="n" class="h-44" />
        </div>

        <p v-else-if="!visibleCourses.length" class="bt-surface p-6 font-inconsolata text-sm text-bta-text-2" role="status">
          {{ emptyText[filter] }}
          <NuxtLink v-if="filter === 'all' || filter === 'in_progress'" to="/cursos" class="bt-focus ml-1 text-bta-pink hover:underline">
            Explorar cursos
          </NuxtLink>
        </p>

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
