<script setup lang="ts">
import type { CoursesResponse } from '~/interfaces/courses.response'
import CourseCard from '@/components/courses/CourseCard.vue'
import { refDebounced } from '@vueuse/core'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 350)
const selectedTeachers = ref<string[]>([])
const levelSelected = ref<string[]>([])
const categorySelected = ref<string[]>([])

const perPage = 9

const { data: teachers } = useAPI('/teacher')
const { data: levels } = useAPI('/level')
const { data: categories } = useAPI('/category')

const courses = ref<CoursesResponse>({
  courses: [],
  pagination: { current_page: 1, per_page: perPage, total_entries: 0, total_pages: 0 },
})

const currentPage = ref(1)
const hasMore = ref(true)
const isLoading = ref(false)
const sentinel = ref<HTMLElement | null>(null)
// Bumped on every new search so stale responses (filters changed mid-request) are discarded.
let requestId = 0

const hasFilters = computed(() => !!(debouncedQuery.value || selectedTeachers.value.length || levelSelected.value.length || categorySelected.value.length))
const activeFilterCount = computed(() => selectedTeachers.value.length + levelSelected.value.length + categorySelected.value.length + (debouncedQuery.value ? 1 : 0))
const total = computed(() => courses.value.pagination.total_entries)

async function loadMoreCourses() {
  if (isLoading.value || !hasMore.value)
    return

  const id = requestId
  isLoading.value = true

  try {
    const { data: coursesData } = await useAPI<CoursesResponse>('/courses', {
      params: {
        'page': currentPage.value,
        'per_page': perPage,
        'query': debouncedQuery.value,
        'users_ids[]': selectedTeachers.value,
        'category_ids[]': categorySelected.value,
        'level_ids[]': levelSelected.value,
      },
    })

    if (id !== requestId)
      return

    if (coursesData.value) {
      courses.value = {
        courses: [...courses.value.courses, ...coursesData.value.courses],
        pagination: coursesData.value.pagination,
      }

      const { current_page, total_pages } = coursesData.value.pagination
      hasMore.value = current_page < total_pages
      currentPage.value++
    }
    else {
      hasMore.value = false
    }
  }
  catch (err) {
    console.error('Error cargando cursos:', err)
    hasMore.value = false
  }
  finally {
    if (id === requestId)
      isLoading.value = false
  }
}

async function resetAndSearch() {
  requestId++
  isLoading.value = false
  courses.value = {
    courses: [],
    pagination: { current_page: 1, per_page: perPage, total_entries: 0, total_pages: 0 },
  }
  currentPage.value = 1
  hasMore.value = true
  await loadMoreCourses()
}

function clearFilters() {
  searchQuery.value = ''
  selectedTeachers.value = []
  levelSelected.value = []
  categorySelected.value = []
}

watch([debouncedQuery, selectedTeachers, levelSelected, categorySelected], resetAndSearch)

// Infinite scroll: load the next page when the end of the list nears the viewport. The scroll container
// is the layout's <main>, so listen in the capture phase (scroll events don't bubble) instead of
// using an IntersectionObserver, whose rootMargin doesn't extend past an overflow-clipped ancestor.
function nearEnd() {
  return !!sentinel.value && sentinel.value.getBoundingClientRect().top < window.innerHeight + 400
}
function loadIfNearEnd() {
  if (nearEnd())
    loadMoreCourses()
}
onMounted(() => {
  loadMoreCourses()
  window.addEventListener('scroll', loadIfNearEnd, { capture: true, passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', loadIfNearEnd, { capture: true }))

// A page can finish loading while the end of the list is still near the viewport (tall screens).
watch(isLoading, async (loading) => {
  if (loading || !hasMore.value)
    return
  await nextTick()
  loadIfNearEnd()
})

function toggleLevel(value: string) {
  levelSelected.value = levelSelected.value.includes(value)
    ? levelSelected.value.filter(v => v !== value)
    : [...levelSelected.value, value]
}

interface Option {
  value: string
  label: string
}

interface Teacher {
  id: string
  name: string
  lastname: string
}

interface Category {
  id: string
  name: string
}

interface Level {
  id: string
  name: string
}

const formattedTeachers = computed<Option[]>(() =>
  (teachers.value as Teacher[] || []).map(teacher => ({
    value: teacher.id,
    label: `${teacher.name} ${teacher.lastname}`,
  })),
)

const formattedCategories = computed<Option[]>(() =>
  (categories.value as Category[] || []).map(category => ({
    value: category.id,
    label: category.name,
  })),
)

const formattedLevels = computed<Option[]>(() =>
  (levels.value as Level[] || []).map(level => ({
    value: level.id,
    label: level.name,
  })),
)

// SEO Metadata
useSeoMeta({
  title: 'Cursos de Hacking Ético',
  description: 'Únete gratis y comienza a aprender seguridad informática desde cero con los mejores hackers.',
  keywords: 'Gratis, Hacking, Wireshark, Hacker, Python, Android, Informática, Seguridad, Academy, Online, Cursos, JavaScript',
  ogType: 'website',
  ogUrl: 'https://backtrackacademy.com/',
  ogTitle: 'Backtrack Academy - Cursos online de Hacking Ético',
  ogDescription: 'Únete gratis y comienza a aprender seguridad informatica desde cero con los mejores hackers.',
  ogImage: 'https://backtrack-academy-01.s3.amazonaws.com/OpenGraph+Facebook.png',
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <header class="mb-6">
      <h1 class="bt-section-title !text-3xl">
        Cursos de hacking ético
      </h1>
      <p class="mt-2 font-inconsolata text-sm text-gray-muted">
        <span class="text-bta-pink">$</span> ls cursos/
        <span v-if="total" class="text-white/70">→ {{ total }} {{ total === 1 ? 'curso' : 'cursos' }}{{ hasFilters ? ' encontrados' : '' }}</span>
      </p>
    </header>

    <!-- Filters -->
    <section class="bt-surface mb-8 space-y-4 !rounded-2xl !border-transparent p-4 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)] sm:p-5" aria-label="Filtros">
      <div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label class="relative block">
          <span class="sr-only">Buscar cursos</span>
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-inconsolata text-bta-pink" aria-hidden="true">&gt;</span>
          <Input
            v-model="searchQuery"
            class="h-11 border-white/10 bg-bta-bg pl-8 font-inconsolata text-white placeholder:text-gray-muted"
            placeholder="buscar cursos…"
          />
        </label>
        <MultiSelect
          class-name="font-inconsolata !min-h-11 !border-white/10 !bg-bta-bg"
          :options="formattedCategories"
          :selected="categorySelected"
          placeholder="Categorías"
          search-placeholder="Buscar categorías..."
          @change="categorySelected = $event"
        />
        <MultiSelect
          class-name="font-inconsolata !min-h-11 !border-white/10 !bg-bta-bg"
          :options="formattedTeachers"
          :selected="selectedTeachers"
          placeholder="Profesores"
          search-placeholder="Buscar profesores..."
          @change="selectedTeachers = $event"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 font-inconsolata text-xs uppercase tracking-wider text-gray-muted">Nivel</span>
        <button
          v-for="level in formattedLevels"
          :key="level.value"
          type="button"
          :aria-pressed="levelSelected.includes(level.value)"
          class="bt-focus border px-3 py-1.5 font-inconsolata text-sm transition-colors duration-200"
          :class="levelSelected.includes(level.value)
            ? 'border-bta-pink bg-bta-pink text-white'
            : 'border-white/10 text-bta-text-2 hover:border-bta-pink/50 hover:text-white'"
          @click="toggleLevel(level.value)"
        >
          {{ level.label }}
        </button>

        <button
          v-if="activeFilterCount"
          type="button"
          class="bt-focus ml-auto inline-flex items-center gap-1.5 font-inconsolata text-sm text-bta-pink transition-opacity hover:opacity-80"
          @click="clearFilters"
        >
          <Icon name="lucide:x" class="size-3.5" />
          Limpiar filtros ({{ activeFilterCount }})
        </button>
      </div>
    </section>

    <!-- Results -->
    <div
      v-if="!isLoading && !courses.courses.length"
      class="grid place-items-center py-20"
    >
      <div class="max-w-md border border-white/[0.08] bg-black/30 p-6 font-inconsolata text-sm">
        <p class="text-white">
          <span class="text-bta-pink">$</span> grep -ri "{{ debouncedQuery || 'filtros' }}" cursos/
        </p>
        <p class="mt-2 text-gray-muted">
          0 resultados. Prueba con otros términos o quita algún filtro.
        </p>
        <button v-if="hasFilters" type="button" class="bt-focus mt-4 text-bta-pink hover:underline" @click="clearFilters">
          &gt; limpiar filtros
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-6">
      <div v-for="course in courses.courses" :key="course.id" class="flex">
        <CourseCard :course="course" />
      </div>
      <template v-if="isLoading">
        <div v-for="n in (courses.courses.length ? 3 : perPage)" :key="`sk${n}`" class="bt-surface overflow-hidden !rounded-2xl !border-transparent">
          <Skeleton class="aspect-video w-full rounded-none" />
          <div class="space-y-3 p-4">
            <Skeleton class="h-6 w-4/5" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-0.5 w-8" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>
      </template>
    </div>

    <div ref="sentinel" class="h-px" aria-hidden="true" />
    <p v-if="!hasMore && courses.courses.length" class="py-10 text-center font-inconsolata text-sm text-gray-muted">
      <span class="text-bta-pink">$</span> fin de la lista<span class="term-cursor ml-1" aria-hidden="true" />
    </p>
  </div>
</template>

<style>
.term-cursor {
  display: inline-block;
  width: 0.45rem;
  height: 0.95rem;
  background: #ec1075;
  vertical-align: text-bottom;
  animation: term-blink 1.1s steps(1) infinite;
}
@keyframes term-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .term-cursor { animation: none; }
}
</style>
