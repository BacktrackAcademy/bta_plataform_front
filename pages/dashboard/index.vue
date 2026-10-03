<script setup lang="ts">
import type { CoursesHistory, CoursesProgressResponse, DashboardCourse, Degree, LatestArticlesResponse, LatestCoursesResponse } from '~/interfaces/dashboard'
import CurrentCourse from '~/components/dashboard/CurrentCourse.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import CourseCard from '~/components/courses/CourseCard.vue'
import LearningPathCard from '~/components/dashboard/LearningPathCard.vue'
import ProgressOverview from '~/components/dashboard/ProgressOverview.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const { data: coursesHistory, status: historyStatus, refresh: refreshHistory } = useAPI<CoursesHistory>('/courses/history')
const { data: progress } = useAPI<CoursesProgressResponse>('/courses/progress')
const { data: degrees, status: degreeStatus } = useAPI<Degree[]>('/degrees')

const { data: latestCourses, status: latestCoursesStatus } = useAPI<LatestCoursesResponse>('/courses', { query: { page: 1, per_page: 3 }, lazy: true })
const { data: latestArticles, status: latestArticlesStatus } = useAPI<LatestArticlesResponse>('/articles', { query: { page: 1, per_page: 3 }, lazy: true })

const loading = computed(() => historyStatus.value === 'pending' || historyStatus.value === 'idle')
const failed = computed(() => historyStatus.value === 'error')

// History courses enriched with real per-course progress and their learning path (when the API provides them).
const courses = computed<DashboardCourse[]>(() => {
  const progressById = new Map((progress.value?.courses ?? []).map(c => [c.id, c]))
  const pathById = new Map((degrees.value ?? []).map(d => [d.id, d.name]))
  return (coursesHistory.value?.courses ?? []).map(course => ({
    ...course,
    ...progressById.get(course.id),
    path: course.degree_id ? pathById.get(course.degree_id) : undefined,
  }))
})

// The course to resume: first one not yet finished, otherwise the first one.
const current = computed(() => courses.value.find(c => (c.percent ?? 0) < 100) ?? courses.value[0])
const others = computed(() => courses.value.filter(c => c.id !== current.value?.id).slice(0, 3))

useSeoMeta({
  title: 'Mi centro de aprendizaje',
  description: 'Continúa tus cursos de hacking ético y ciberseguridad donde los dejaste.',
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-10 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <DashboardHeader class="animate-rise-in" />

    <!-- Error controlado -->
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
        @click="refreshHistory()"
      >
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </section>

    <template v-else>
      <!-- 1. Continuar + 2. Progreso -->
      <section class="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" aria-label="Continuar curso">
        <div v-if="loading" class="bt-surface flex flex-col md:flex-row">
          <Skeleton class="aspect-video w-full rounded-none md:aspect-auto md:min-h-[220px] md:w-[44%]" />
          <div class="flex-1 space-y-4 p-7">
            <Skeleton class="h-3 w-28" />
            <Skeleton class="h-7 w-4/5" />
            <Skeleton class="mt-6 h-8 w-20" />
            <Skeleton class="h-2 w-full rounded-full" />
            <Skeleton class="mt-6 h-12 w-44" />
          </div>
        </div>
        <CurrentCourse v-else-if="current" :course="current" class="animate-rise-in [animation-delay:80ms]" />
        <div v-else class="bt-surface flex flex-col items-start justify-center gap-4 !rounded-2xl !border-transparent p-8 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)]">
          <p class="bt-eyebrow">
            En curso
          </p>
          <h2 class="font-oswald text-2xl font-semibold text-white">
            Aún no has comenzado ningún curso
          </h2>
          <p class="max-w-md text-sm text-bta-text-2">
            Elige tu primer curso y aquí podrás retomarlo con un solo clic.
          </p>
          <NuxtLink
            to="/cursos"
            class="bt-focus group/cta inline-flex h-12 items-center gap-2.5 rounded-md bg-bta-pink px-6 text-[15px] font-semibold text-white transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_12px_32px_-12px_rgba(236,16,117,0.8)]"
          >
            Explorar cursos
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover/cta:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>

        <ProgressOverview :history="coursesHistory" :loading="loading" class="animate-rise-in [animation-delay:160ms]" />
      </section>

      <!-- 3. Continúa aprendiendo -->
      <section v-if="loading || others.length" aria-labelledby="continue-title">
        <div class="mb-4 flex items-end justify-between gap-4">
          <h2 id="continue-title" class="bt-section-title">
            Continúa aprendiendo
          </h2>
          <NuxtLink to="/mi-progreso" class="bt-focus group inline-flex items-center gap-1.5 rounded text-sm text-bta-text-2 transition-colors hover:text-white">
            Ver todo mi progreso
            <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <template v-if="loading">
            <div v-for="n in 3" :key="n" class="bt-surface overflow-hidden">
              <Skeleton class="aspect-video w-full rounded-none" />
              <div class="space-y-3 p-4">
                <Skeleton class="h-3 w-24" />
                <Skeleton class="h-5 w-4/5" />
                <Skeleton class="h-1.5 w-full rounded-full" />
              </div>
            </div>
          </template>
          <CourseCard
            v-for="(course, i) in others"
            v-else
            :key="course.id"
            :course="course"
            class="animate-rise-in"
            :style="{ animationDelay: `${240 + i * 70}ms` }"
          />
        </div>
      </section>

      <!-- 4. Rutas de especialización -->
      <section v-if="degreeStatus === 'pending' || degrees?.length" aria-labelledby="paths-title">
        <div class="mb-4 flex items-end justify-between gap-4">
          <h2 id="paths-title" class="bt-section-title">
            Rutas de especialización
          </h2>
          <NuxtLink to="/cursos" class="bt-focus group inline-flex items-center gap-1.5 rounded text-sm text-bta-text-2 transition-colors hover:text-white">
            Ver todas las rutas
            <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <template v-if="degreeStatus === 'pending'">
            <Skeleton v-for="n in 4" :key="n" class="h-[68px] rounded-xl" />
          </template>
          <LearningPathCard v-for="degree in degrees" v-else :key="degree.id" :degree="degree" />
        </div>
      </section>

      <!-- 5. Últimos cursos publicados -->
      <section v-if="latestCoursesStatus === 'pending' || latestCourses?.courses?.length" aria-labelledby="latest-courses-title">
        <div class="mb-4 flex items-end justify-between gap-4">
          <h2 id="latest-courses-title" class="bt-section-title">
            Últimos cursos publicados
          </h2>
          <NuxtLink to="/cursos" class="bt-focus group inline-flex items-center gap-1.5 rounded text-sm text-bta-text-2 transition-colors hover:text-white">
            Ver todos los cursos
            <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <template v-if="latestCoursesStatus === 'pending'">
            <div v-for="n in 3" :key="n" class="bt-surface overflow-hidden">
              <Skeleton class="aspect-video w-full rounded-none" />
              <div class="space-y-3 p-4">
                <Skeleton class="h-5 w-4/5" />
                <Skeleton class="h-3 w-1/3" />
              </div>
            </div>
          </template>
          <CourseCard v-for="course in latestCourses?.courses" v-else :key="course.id" :course="course" />
        </div>
      </section>

      <!-- 6. Últimos artículos publicados -->
      <section v-if="latestArticlesStatus === 'pending' || latestArticles?.data?.length" aria-labelledby="latest-articles-title">
        <div class="mb-4 flex items-end justify-between gap-4">
          <h2 id="latest-articles-title" class="bt-section-title">
            Últimos artículos publicados
          </h2>
          <NuxtLink to="/articulos" class="bt-focus group inline-flex items-center gap-1.5 rounded text-sm text-bta-text-2 transition-colors hover:text-white">
            Ver todos los artículos
            <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <template v-if="latestArticlesStatus === 'pending'">
            <div v-for="n in 3" :key="n" class="bt-surface overflow-hidden">
              <Skeleton class="aspect-video w-full rounded-none" />
              <div class="space-y-3 p-4">
                <Skeleton class="h-5 w-full" />
                <Skeleton class="h-5 w-2/3" />
              </div>
            </div>
          </template>
          <ArticleCard v-for="article in latestArticles?.data" v-else :key="article.id" :article="article" />
        </div>
      </section>
    </template>
  </div>
</template>
