<script setup lang="ts">
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

// Single course widget used across the platform (dashboard, catalog…). Optional fields are hidden when absent.
const props = defineProps<{
  course: {
    titulo: string
    slug: string
    image_thumb?: string | null
    level_name?: string
    shortdes?: string
    pageviews?: number
    number_videos?: number
    price?: number | null
    created_at?: string
    total_duration_text?: string
    total_duration_seconds?: number
    /** When set, shows the user's progress in the course. */
    percent?: number
    teacher?: { name?: string, lastname?: string, avatar_url?: string } | null
  }
}>()

const LEVELS = ['Básicos', 'Intermedios', 'Avanzados', 'Experto']
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
// Undefined price = not applicable (e.g. courses the user already owns): hide the pill instead of showing "Gratis".
const price = computed(() => (props.course.price === undefined ? '' : props.course.price ? `$ ${props.course.price}` : 'Gratis'))
const views = computed(() => (typeof props.course.pageviews === 'number' ? props.course.pageviews.toLocaleString('es-CL') : ''))
const levelRank = computed(() => LEVELS.findIndex(l => l.toLowerCase() === props.course.level_name?.toLowerCase()) + 1)
const isNew = computed(() => {
  const t = props.course.created_at ? Date.parse(props.course.created_at) : Number.NaN
  return !Number.isNaN(t) && Date.now() - t < NEW_WINDOW_MS
})
const duration = computed(() => formatCourseDuration(props.course))
const { onPointerMove } = useSpotlight()
const hasProgress = computed(() => typeof props.course.percent === 'number')
const percent = computed(() => Math.min(100, Math.max(0, Math.round(props.course.percent ?? 0))))
</script>

<template>
  <NuxtLink
    :to="`/curso/${course.slug}`"
    @pointermove="onPointerMove"
    class="bt-surface bt-focus group relative flex h-full w-full flex-col overflow-hidden !rounded-2xl !border-transparent shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-transparent transition-all duration-300 ease-out hover:bg-bta-elevated hover:shadow-[0_18px_40px_-22px_rgba(236,16,117,0.3)] hover:ring-white/[0.08] motion-safe:hover:-translate-y-0.5"
  >
    <span
      class="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style="background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(236, 16, 117, 0.09), transparent 70%)"
      aria-hidden="true"
    />
    <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand>
      <span
        v-if="course.level_name"
        class="absolute right-3 top-3 inline-flex items-center gap-2 bg-bta-pink px-3 py-1.5 font-inconsolata text-sm text-white"
      >
        <span v-if="levelRank" class="flex items-end gap-px" aria-hidden="true">
          <span
            v-for="n in 4"
            :key="n"
            class="w-[3px] rounded-[1px]"
            :class="n <= levelRank ? 'bg-white' : 'bg-white/35'"
            :style="{ height: `${n * 3 + 3}px` }"
          />
        </span>
        {{ course.level_name }}
      </span>
      <span
        v-if="isNew"
        class="absolute left-3 top-3 border border-bta-pink/60 bg-black/60 px-2 py-1 font-inconsolata text-xs uppercase tracking-wider text-bta-pink backdrop-blur"
      >
        Nuevo
      </span>
      <span
        v-if="duration"
        class="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 font-inconsolata text-xs text-white backdrop-blur"
      >
        <Icon name="lucide:clock" class="size-3" />
        {{ duration }}
      </span>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 min-h-[3.4rem] font-oswald text-2xl font-semibold leading-[1.15] text-white transition-colors duration-300 group-hover:text-white">
        {{ course.titulo }}
      </h3>

      <div v-if="author" class="mt-3 flex items-center gap-2.5">
        <TeacherAvatar :src="course.teacher?.avatar_url" :name="author" />
        <span class="min-w-0 flex-1 truncate font-inconsolata text-sm text-white">{{ author }}</span>
      </div>

      <div class="mt-3 h-0.5 w-8 bg-bta-pink transition-all duration-300 group-hover:w-12" />

      <p v-if="course.shortdes" class="mt-3 line-clamp-3 font-inconsolata text-sm leading-relaxed text-[#6B6F9A]">
        {{ course.shortdes }}
      </p>

      <div v-if="hasProgress" class="mt-4 flex items-center gap-3">
        <ProgressBar :value="percent" :label="`Progreso en ${course.titulo}`" />
        <span class="font-inconsolata text-xs tabular-nums text-white/80">{{ percent }}%</span>
      </div>

      <div class="h-5 shrink-0" />
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4 font-inconsolata text-sm">
        <span v-if="hasProgress && !price" class="inline-flex items-center gap-1.5 font-medium text-white/80 transition-colors group-hover:text-bta-pink">
          Continuar
          <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <div class="flex min-w-0 items-center gap-3 text-gray-muted">
          <span v-if="views" class="inline-flex items-center gap-1.5" title="Visitas">
            <Icon name="lucide:eye" class="size-3.5" />
            {{ views }}
          </span>
          <span v-if="course.number_videos" class="inline-flex items-center gap-1.5">
            <Icon name="lucide:play-circle" class="size-3.5" />
            {{ course.number_videos }} lecciones
          </span>
        </div>
        <span v-if="price" class="shrink-0 rounded-md border border-bta-pink/50 px-2.5 py-0.5 font-semibold text-bta-pink transition-colors duration-300 group-hover:border-bta-pink/80 group-hover:bg-bta-pink/10">{{ price }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
