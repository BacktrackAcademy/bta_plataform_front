<script setup lang="ts">
// import { useSeoMeta } from '#app'
import { useRoute } from 'vue-router'

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
  teacher?: Teacher
  syllabus?: Theme[]
}

const route = useRoute()
const { data: course } = await useAPI<Course>(`/course/${route.params.slug}`)

const stars = computed(() => Math.min(5, Math.max(0, Math.round(course.value?.stars_evaluation ?? 0))))
const isFree = computed(() => !course.value?.price)
const heroImage = computed(() => course.value?.wallpaper_thumb || course.value?.image_thumb)
const teacherName = computed(() => [course.value?.teacher?.name, course.value?.teacher?.lastname].filter(Boolean).join(' '))
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
  <div v-if="course" class="bg-bta-bg">
    <!-- HERO -->
    <section class="relative isolate overflow-hidden border-b border-white/[0.06]">
      <img
        v-if="heroImage"
        :src="heroImage"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-20 size-full scale-110 object-cover opacity-30 blur-sm"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-bta-bg/60 via-bta-bg/85 to-bta-bg" />
      <div class="bt-tech-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div class="pointer-events-none absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-bta-pink/15 blur-3xl" />

      <div class="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <nav aria-label="Ruta" class="mb-6 font-inconsolata text-sm text-white/50">
          <NuxtLink to="/cursos" class="transition-colors hover:text-bta-pink">~/cursos</NuxtLink>
          <span class="mx-1 text-bta-pink">/</span>
          <span class="text-white/80">{{ course.slug }}</span>
        </nav>

        <div class="flex flex-wrap items-center gap-2 font-inconsolata text-sm">
          <span v-if="course.level_name" class="bg-bta-pink px-3 py-1 text-white">{{ course.level_name }}</span>
          <span class="inline-flex items-center gap-2 px-3 py-1 text-white/70" :title="`Nivel ${levelIndex + 1} de 4`">
            <span class="flex items-end gap-0.5" aria-hidden="true">
              <span v-for="n in 4" :key="n" class="w-1 rounded-sm" :class="n <= levelIndex + 1 ? 'bg-bta-pink' : 'bg-white/15'" :style="{ height: `${n * 4 + 2}px` }" />
            </span>
            Nivel {{ levelIndex + 1 }}/4
          </span>
        </div>

        <h1 class="mt-4 max-w-3xl font-oswald text-4xl font-bold uppercase leading-[1.05] tracking-wide text-white sm:text-5xl lg:text-6xl">
          {{ course.titulo }}
        </h1>

        <p class="mt-5 max-w-2xl font-inconsolata text-lg leading-relaxed text-bta-text-2">
          {{ course.descripcion }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 font-inconsolata text-sm">
          <NuxtLink :to="`/curso/${course.slug}/opiniones`" class="group flex items-center gap-2">
            <span class="flex" role="img" :aria-label="`${stars} de 5 estrellas`">
              <Icon v-for="n in 5" :key="n" name="lucide:star" class="size-4" :class="n <= stars ? 'fill-[#fddd5b] text-[#fddd5b]' : 'text-white/20'" />
            </span>
            <span class="text-cyan-300 underline-offset-2 group-hover:underline">{{ course.count_evaluation ?? 0 }} opiniones</span>
          </NuxtLink>
          <span v-if="course.students" class="inline-flex items-center gap-1.5 text-white/70">
            <Icon name="lucide:users" class="size-4 text-bta-pink" /> {{ course.students }} estudiantes
          </span>
        </div>

        <div v-if="teacherName" class="mt-8 inline-flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-2 pr-5 backdrop-blur">
          <img v-if="course.teacher?.avatar_url" :src="course.teacher.avatar_url" :alt="teacherName" class="size-11 rounded-full object-cover ring-2 ring-bta-pink/60">
          <div>
            <p class="font-inconsolata text-xs text-white/40">
              <span class="text-bta-pink">$</span> whoami --instructor
            </p>
            <p class="font-oswald text-lg leading-tight text-white">
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
          <h2 id="temario" class="font-oswald text-3xl font-bold uppercase tracking-wide text-white">
            Temario
          </h2>
          <p class="font-inconsolata text-sm text-white/50">
            {{ course.syllabus?.length ?? 0 }} módulos · {{ totalLessons }} lecciones
          </p>
        </div>

        <div class="space-y-5">
          <article
            v-for="(theme, ti) in course.syllabus"
            :key="ti"
            class="bt-surface overflow-hidden !rounded-2xl !border-transparent shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)]"
          >
            <header class="flex items-center gap-4 border-b border-white/[0.06] px-5 py-4">
              <span class="font-oswald text-3xl font-bold leading-none text-bta-pink/90">{{ pad(ti + 1) }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="font-oswald text-xl font-semibold leading-snug text-white">
                  {{ theme.titulo }}
                </h3>
                <p class="font-inconsolata text-sm text-white/50">
                  {{ theme.lessons ?? theme.videos?.length }} lecciones
                </p>
              </div>
            </header>

            <ul>
              <li v-for="(video, vi) in theme.videos" :key="vi" class="border-b border-white/[0.04] last:border-b-0">
                <NuxtLink
                  v-if="canWatch(video)"
                  :to="`/video/${video.slug}`"
                  class="group flex items-center gap-3 px-5 py-3.5 font-inconsolata transition-colors hover:bg-bta-pink/[0.07]"
                >
                  <Icon name="lucide:play-circle" class="size-5 shrink-0 text-bta-pink" />
                  <span class="min-w-0 flex-1 text-white transition-colors group-hover:text-bta-pink">{{ video.titlevideo }}</span>
                  <span v-if="!isFree" class="hidden bg-bta-pink/15 px-2 py-0.5 text-xs text-bta-pink sm:inline">GRATIS</span>
                  <span class="flex shrink-0 items-center gap-1.5 text-sm text-white/60">
                    <Icon name="lucide:clock" class="size-3.5" />{{ video.total }}
                  </span>
                </NuxtLink>
                <NuxtLink
                  v-else
                  :to="`/suscripciones`"
                  class="group flex items-center gap-3 px-5 py-3.5 font-inconsolata transition-colors hover:bg-white/[0.03]"
                >
                  <Icon name="lucide:lock" class="size-5 shrink-0 text-white/30" />
                  <span class="min-w-0 flex-1 text-white/60">{{ video.titlevideo }}</span>
                  <span class="flex shrink-0 items-center gap-1.5 text-sm text-white/40">
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
        <div class="bt-surface !rounded-2xl !border-bta-pink/30 p-6 shadow-[0_0_40px_-18px_rgba(236,16,117,0.7)] lg:sticky lg:top-6">
          <p class="font-inconsolata text-sm text-white/50">
            <span class="text-bta-pink">$</span> consíguelo
          </p>
          <p class="mt-1 font-oswald text-5xl font-semibold text-white">
            <template v-if="isFree">
              GRATIS
            </template>
            <template v-else>
              {{ course.price }} <span class="text-2xl text-white/60">USD</span>
            </template>
          </p>

          <NuxtLink
            to="/suscripciones"
            class="bt-focus mt-5 flex h-12 items-center justify-center gap-2 bg-bta-pink font-oswald text-lg uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-10px_rgba(236,16,117,0.9)]"
          >
            <Icon name="lucide:zap" class="size-4" />
            Comprar suscripción mensual
          </NuxtLink>
          <p class="mt-3 text-center font-inconsolata text-sm text-white/60">
            <template v-if="!isFree">
              O compra solo este curso por {{ course.price }} USD
            </template>
            <template v-else>
              ¡Es absolutamente gratis!
            </template>
          </p>

          <ul class="mt-6 space-y-3 border-t border-white/[0.06] pt-5 font-inconsolata text-sm text-white/80">
            <li v-if="totalLessons" class="flex items-center gap-3">
              <Icon name="lucide:video" class="size-4 text-bta-pink" /> {{ totalLessons }} lecciones en video
            </li>
            <li v-if="course.total_duration_text" class="flex items-center gap-3">
              <Icon name="lucide:clock" class="size-4 text-bta-pink" /> {{ course.total_duration_text }} de contenido
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:infinity" class="size-4 text-bta-pink" /> Acceso a tu propio ritmo
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:award" class="size-4 text-bta-pink" /> Certificado verificable
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
