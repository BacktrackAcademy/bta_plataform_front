<script setup lang="ts">
// import { useSeoMeta } from '#app'
import { useRoute } from 'vue-router'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

interface Teacher {
  name?: string
  lastname?: string
  headline?: string
  avatar_url?: string
}

interface Video {
  slug: string
  titlevideo: string
  total: string
  is_free?: boolean
}

interface Theme {
  titulo: string
  lessons: number
  videos: Video[]
}

interface Course {
  id: number
  slug: string
  titulo: string
  descripcion: string
  wallpaper_thumb?: string
  image_thumb?: string
  metatag: string
  price?: number | null
  level_name?: string
  stars_evaluation?: number
  count_evaluation?: number
  students?: number
  number_videos?: number
  total_duration_text?: string
  total_duration_seconds?: number
  teacher?: Teacher
  syllabus?: Theme[]
}

const route = useRoute()
const { data: course } = await useAPI<Course>(`/course/${route.params.slug}`)

const stars = computed(() => Math.min(5, Math.max(0, Math.round(course.value?.stars_evaluation ?? 0))))
const isFree = computed(() => !course.value?.price)
const heroImage = computed(() => course.value?.wallpaper_thumb || course.value?.image_thumb)
const teacherName = computed(() => [course.value?.teacher?.name, course.value?.teacher?.lastname].filter(Boolean).join(' '))
const duration = computed(() => (course.value ? formatCourseDuration(course.value) : ''))
const levels = ['Básicos', 'Intermedios', 'Avanzados', 'Experto']
const levelIndex = computed(() => {
  const i = levels.indexOf(course.value?.level_name ?? '')
  return i === -1 ? 0 : i
})
const totalLessons = computed(() => course.value?.number_videos ?? course.value?.syllabus?.reduce((n, t) => n + (t.lessons || t.videos?.length || 0), 0) ?? 0)
const pad = (n: number) => String(n).padStart(2, '0')
function canWatch(video: Video) {
  return video.is_free || isFree.value
}

// SEO Metadata
// useSeoMeta({
//   title: () => `${course.value?.titulo} - Backtrack Academy`,
//   description: () => course.value?.descripcion || '',
//   keywords: () => course.value?.metatag || '',
//   ogType: 'website',
//   ogUrl: 'https://backtrackacademy.com/',
//   ogTitle: () => course.value?.titulo || 'Backtrack Academy',
//   ogDescription: () => course.value?.descripcion || '',
//   ogImage: () => course.value?.wallpaper_thumb || '',
// })
</script>

<template>
  <div v-if="course" class="bg-background">
    <!-- HERO -->
    <section class="relative isolate overflow-hidden border-b border-subtle">
      <img
        v-if="heroImage"
        :src="heroImage"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-20 size-full scale-110 object-cover opacity-30 blur-sm"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      <div class="bt-tech-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      
      <div class="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <nav aria-label="Ruta" class="mb-6 font-mono text-sm text-foreground-muted">
          <NuxtLink to="/cursos" class="transition-colors hover:text-primary-text">~/cursos</NuxtLink>
          <span class="mx-1 text-primary-text">/</span>
          <span class="text-foreground-secondary">{{ course.slug }}</span>
        </nav>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span v-if="course.level_name" class="bt-badge bt-badge-primary px-3 py-1 text-sm">{{ course.level_name }}</span>
          <span class="inline-flex items-center gap-2 px-3 py-1 text-foreground-muted" :title="`Nivel ${levelIndex + 1} de 4`">
            <span class="flex items-end gap-0.5" aria-hidden="true">
              <span v-for="n in 4" :key="n" class="w-1 rounded-sm" :class="n <= levelIndex + 1 ? 'bg-primary' : 'bg-foreground/15'" :style="{ height: `${n * 4 + 2}px` }" />
            </span>
            Nivel {{ levelIndex + 1 }}/4
          </span>
        </div>

        <h1 class="t-display mt-4 max-w-3xl !text-4xl sm:!text-5xl lg:!text-6xl">
          {{ course.titulo }}
        </h1>

        <p class="mt-5 max-w-2xl text-lg leading-relaxed text-foreground-secondary">
          {{ course.descripcion }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <NuxtLink :to="`/curso/${course.slug}/opiniones`" class="group flex items-center gap-2">
            <span class="flex" role="img" :aria-label="`${stars} de 5 estrellas`">
              <Icon v-for="n in 5" :key="n" name="lucide:star" class="size-4" :class="n <= stars ? 'fill-warning text-warning' : 'text-foreground/20'" />
            </span>
            <span class="text-primary-text underline-offset-2 group-hover:underline">{{ course.count_evaluation ?? 0 }} opiniones</span>
          </NuxtLink>
          <span v-if="course.students" class="inline-flex items-center gap-1.5 text-foreground-muted">
            <Icon name="lucide:users" class="size-4 text-primary-text" /> {{ course.students }} estudiantes
          </span>
        </div>

        <div v-if="teacherName" class="mt-8 inline-flex items-center gap-3 rounded-lg border border-subtle bg-scrim/30 py-2 pl-2 pr-5 backdrop-blur">
          <TeacherAvatar :src="course.teacher?.avatar_url" :name="teacherName" class="!size-11 text-base" />
          <div>
            <p class="font-mono text-xs text-foreground-muted">
              <span class="text-primary-text">$</span> whoami --instructor
            </p>
            <p class="font-oswald text-lg leading-tight text-foreground">
              {{ teacherName }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- BODY -->
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
      <!-- Temario -->
      <section aria-labelledby="temario">
        <div class="mb-8 flex items-end justify-between gap-4">
          <h2 id="temario" class="bt-section-title">
            Temario
          </h2>
          <p class="t-meta">
            {{ course.syllabus?.length ?? 0 }} módulos · {{ totalLessons }} lecciones
          </p>
        </div>

        <div class="space-y-5">
          <article
            v-for="(theme, ti) in course.syllabus"
            :key="ti"
            class="bt-surface overflow-hidden"
          >
            <header class="flex items-center gap-4 border-b border-subtle px-5 py-4">
              <span class="font-oswald text-3xl font-bold leading-none text-primary-text/90">{{ pad(ti + 1) }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-oswald text-xl font-semibold leading-snug text-foreground">
                  {{ theme.titulo }}
                </h3>
                <p class="t-meta">
                  {{ theme.lessons ?? theme.videos?.length }} lecciones
                </p>
              </div>
            </header>

            <ul>
              <li v-for="(video, vi) in theme.videos" :key="vi" class="border-b border-subtle last:border-b-0">
                <NuxtLink
                  v-if="canWatch(video)"
                  :to="`/video/${video.slug}`"
                  class="group flex items-center gap-3 px-5 py-3.5 text-[15px] transition-colors duration-fast hover:bg-surface-3"
                >
                  <Icon name="lucide:play-circle" class="size-5 shrink-0 text-primary-text" />
                  <span class="min-w-0 flex-1 text-foreground transition-colors group-hover:text-primary-text">{{ video.titlevideo }}</span>
                  <span v-if="!isFree" class="bt-badge bt-badge-primary hidden sm:inline-flex">GRATIS</span>
                  <span class="t-meta flex shrink-0 items-center gap-1.5">
                    <Icon name="lucide:clock" class="size-3.5" />{{ video.total }}
                  </span>
                </NuxtLink>
                <NuxtLink
                  v-else
                  :to="`/suscripciones`"
                  class="group flex items-center gap-3 px-5 py-3.5 text-[15px] transition-colors duration-fast hover:bg-surface-3"
                >
                  <Icon name="lucide:lock" class="size-5 shrink-0 text-foreground-subtle" />
                  <span class="min-w-0 flex-1 text-foreground-muted">{{ video.titlevideo }}</span>
                  <span class="t-meta flex shrink-0 items-center gap-1.5">
                    <Icon name="lucide:clock" class="size-3.5" />{{ video.total }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- Purchase card -->
      <aside class="lg:order-last">
        <div class="bt-surface border-border p-6 shadow-elev-2 lg:sticky lg:top-6">
          <p class="font-mono text-sm text-foreground-muted">
            <span class="text-primary-text">$</span> consíguelo
          </p>
          <p class="mt-1 font-oswald text-5xl font-semibold text-foreground">
            <template v-if="isFree">
              GRATIS
            </template>
            <template v-else>
              {{ course.price }} <span class="text-2xl text-foreground-muted">USD</span>
            </template>
          </p>

          <NuxtLink
            to="/suscripciones"
            class="bt-btn-primary bt-btn-lg mt-5 w-full font-oswald text-lg uppercase tracking-wider"
          >
            <Icon name="lucide:zap" class="size-4" />
            Comprar suscripción mensual
          </NuxtLink>
          <p class="t-small mt-3 text-center">
            <template v-if="!isFree">
              O compra solo este curso por {{ course.price }} USD
            </template>
            <template v-else>
              ¡Es absolutamente gratis!
            </template>
          </p>

          <ul class="mt-6 space-y-3 border-t border-subtle pt-5 text-sm text-foreground-secondary">
            <li v-if="totalLessons" class="flex items-center gap-3">
              <Icon name="lucide:video" class="size-4 text-primary-text" /> {{ totalLessons }} lecciones en video
            </li>
            <li v-if="duration" class="flex items-center gap-3">
              <Icon name="lucide:clock" class="size-4 text-primary-text" /> {{ duration }} de contenido
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:infinity" class="size-4 text-primary-text" /> Acceso a tu propio ritmo
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:award" class="size-4 text-primary-text" /> Certificado verificable
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
